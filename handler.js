const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';

        const m = msg.message;

        // 🔥 EXTRACTION SOLIDE
        const content = m.conversation || 
                        m.extendedTextMessage?.text || 
                        m.imageMessage?.caption || 
                        m.videoMessage?.caption || 
                        m.buttonsResponseMessage?.selectedButtonId ||
                        m.listResponseMessage?.singleSelectReply?.selectedRowId ||
                        m.documentWithCaptionMessage?.message?.documentMessage?.caption || "";

        const body = content.trim();

        console.log("📨 TEXTE REÇU:", body || "[VIDE]");

        const prefix = config.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        if (isCmd) {
            console.log(`📩 [ɢʜᴏꜱᴛɢ-x] Commande : ${commandName} | Par : ${pushName}`);
        }

        // 1. Auto-React
        if (config.autoReact && !msg.key.fromMe) {
            const emojis = ['⚡','💀','🔥','✨','👑','❤️','🙏🏾','🇧🇫'];
            await sock.sendMessage(from, {
                react: {
                    text: isCmd ? '⏳' : emojis[Math.floor(Math.random() * emojis.length)],
                    key: msg.key
                }
            });
        }

        // 2. Anti-Lien
        if (isGroup && !isOwner(sender) && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // 3. Commandes
        if (isCmd && commandName) {

            const command = global.commands.get(commandName) || 
                [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            // 🔥 DEBUG SI COMMANDE INTROUVABLE
            if (!command) {
                console.log("❌ Commande inconnue:", commandName);
                return;
            }

            const ownerStatus = isOwner(sender);
            if (config.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup)
                return sock.sendMessage(from, { text: "🚩 *ᴄᴏᴍᴍᴀɴᴅᴇ ɢʀᴏᴜᴘᴇ ᴜɴɪǫᴜᴇ.*" });

            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            const reply = (text) => {
                const signedText = `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                return sock.sendMessage(from, { text: signedText }, { quoted: msg });
            };

            await command.execute(sock, msg, args, {
                from,
                sender,
                isGroup,
                isOwner: ownerStatus,
                isAdmin: adminStatus,
                prefix,
                pushName,
                reply,
                react: (emoji) => sock.sendMessage(from, {
                    react: { text: emoji, key: msg.key }
                })
            });
        }

    } catch (err) {
        console.error('❌ [HANDLER ERROR]:', err);
    }
};