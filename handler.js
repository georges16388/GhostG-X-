/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.3 - Bulletproof)
 * Refactor complet pour stabilité et performance - SQLite & JSON Hybrid
 */
const groupStats = require('./utils/groupstats');

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const { createStickerBuffer } = require('./utils/sticker'); 

// --- SYSTÈME ANTI-RÉPÉTITION & COOLDOWN ---
const processedMessages = new Map();
const reactionCooldown = new Map();
const MESSAGE_TTL = 15 * 1000;
const PROCESSED_CLEAN_INTERVAL = 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [id, ts] of processedMessages) {
        if (now - ts > MESSAGE_TTL) processedMessages.delete(id);
    }
}, PROCESSED_CLEAN_INTERVAL);

// --- INITIALISATION DES COMMANDES ---
global.commands = loadCommands();
// Note: aliasMap n'est plus nécessaire car le nouveau Loader fusionne les alias dans global.commands

// --- UTILITAIRES ---
const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

const normalizeJid = (jid) => {
    if (!jid) return null;
    const match = jid.match(/(\d+)@/);
    return match ? match[1] : jid.split('@')[0];
};

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// MODIFICATION 1 : isAdmin optimisé pour le Store Baileys v6.7.9
const isAdmin = async (sock, participant, groupId) => {
    if (!groupId?.endsWith('@g.us')) return false;
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const p = groupMetadata.participants.find(v => v.id === participant);
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

// --- HANDLER PRINCIPAL ---
const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        // 💾 ÉTAPE CRUCIALE : SAUVEGARDE DANS SQLITE (Pour Anti-Delete)
        database.saveMessage(msg); 

        // --- ANTI-DUPLICATION ---
        const msgId = msg.key.id;
        const now = Date.now();
        if (processedMessages.has(msgId)) return;
        processedMessages.set(msgId, now);

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || from) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const config = global.config;
        const prefix = config.prefix || '.';

        // MODIFICATION 2 : getText étendu pour les nouveaux types de messages
        const getText = (m) => {
            return m?.conversation || 
                   m?.extendedTextMessage?.text || 
                   m?.imageMessage?.caption ||
                   m?.videoMessage?.caption || 
                   m?.buttonsResponseMessage?.selectedButtonId ||
                   m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   m?.templateButtonReplyMessage?.selectedId || 
                   m?.pollUpdateMessage?.pollUpdate?.name || // Nouveau : Polls
                   m?.interactiveResponseMessage?.body?.text || ""; // Nouveau : Interactive Msg
        };
        const body = getText(msg.message).trim();
        const ownerStatus = global.isOwner(sender);
        const isSupreme = global.isSupreme(sender);

        if (config.selfMode && !ownerStatus && !msg.key.fromMe) return;

        // --- TIC-TAC-TOE (Sandboxed) ---
        try {
            const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
            if (await handleTicTacToeMove(sock, msg, { sender, from, body })) return;
        } catch (e) { console.error("❌ TicTacToe Error:", e); }

        // --- COMMANDE PRE-REQUIS ---
        let activePrefix = prefix;
        if (isSupreme && body.startsWith('>')) activePrefix = '>';
        const isCmd = body.startsWith(activePrefix);
        const commandName = isCmd ? body.slice(activePrefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : body.trim().split(/\s+/);

        const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;
        const isBotAdmin = isGroup ? await isAdmin(sock, sock.user.id, from) : false;

        // --- AUTO REACT ---
        try {
            if (config.autoReact && canReact(from)) {
                let emoji = '⏳';
                if (!msg.key.fromMe && !isCmd) {
                    const emojis = ['⚡','💀','🔥','✨','❤️','🙏🏾','😉','😍','✝️','😏','😎','🫂','👋🏾','❓','💩','😊'];
                    emoji = emojis[Math.floor(Math.random() * emojis.length)];
                } else if (ownerStatus) emoji = config.supremeReact || '👑';
                await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
            }
        } catch {}

        // --- ANTI-MENTION (Sandboxed) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.antigroupmention) {
                    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    const isMentioningAll = body.includes('@everyone') || body.includes('@all') || mentions.length > 10;
                    if (isMentioningAll && isBotAdmin) {
                        await sock.sendMessage(from, { delete: msg.key });
                        if (groupSettings.antigroupmentionaction === 'kick') {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                        }
                        return;
                    }
                }
            } catch (e) { console.error("❌ Anti-Mention Error:", e); }
        }

        // --- ANTI-LINK (Sandboxed) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.antilink) {
                    const linkPattern = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9a-zA-Z]{20,26}|bit\.ly\/\w+)/i;
                    if (body.match(linkPattern) && isBotAdmin) {
                        await sock.sendMessage(from, { delete: msg.key });
                        return;
                    }
                }
            } catch (e) { console.error("❌ Anti-Link Error:", e); }
        }

        // --- AUTO-STICKER ---
        const isMedia = msg.message?.imageMessage || msg.message?.videoMessage;
        if (isGroup && isMedia && !isCmd) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.autosticker) {
                    const mediaKey = msg.message.imageMessage ? 'imageMessage' : 'videoMessage';
                    const stream = await downloadContentFromMessage(msg.message[mediaKey], mediaKey.replace('Message',''));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    const stickerBuffer = await createStickerBuffer(buffer, { pack:"ɢʜᴏsᴛɢ-x ᴍᴅ", author: pushName });
                    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                }
            } catch (e) { console.error("❌ AutoSticker Error:", e); }
        }

        // --- GHOSTG INTEL (NLP) ---
        try {
            global.ghostgMode = global.ghostgMode || 'off';
            if (global.ghostgMode !== 'off' && ownerStatus && !isCmd && body) {
                const ghostgCmd = global.commands.get('ghostg');
                if (ghostgCmd) {
                    await ghostgCmd.execute(sock, msg, args, { from, sender, isGroup, isOwner:ownerStatus, isSupreme, isAdmin:adminStatus, isBotAdmin, prefix, pushName,
                                    reply:(text)=>sock.sendMessage(from,{text:`${text}\n\n> *ᴘᴏᴡᴇᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`},{quoted:msg}),
                                    react:(emoji)=>sock.sendMessage(from,{react:{text:emoji,key:msg.key}}),
                                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null });
                }
            }
        } catch (e){ console.error("❌ GhostG Intel Error:", e); }

   // --- STATS & EXECUTION COMMANDE ---
if (isGroup) {
    try { 
        groupStats.addMsg(from, sender); // <-- Remplacement ici
    } catch (e) {
        console.error("Stats Error:", e);
    }
}

if (isCmd && commandName) {
    const command = global.commands.get(commandName);
    if (!command) return;
    
    // ... la suite de ton code (ne supprime pas le reste !)


            // --- LOGIQUE DE REPLY AVEC SIGNATURE AUTO ---
            const reply = (text) => {
                const sig = `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                const finalMsg = text.includes('ᴘᴏᴡᴇʀᴇᴅ ʙʏ') ? text : `${text}${sig}`;
                return sock.sendMessage(from, { text: finalMsg }, { quoted: msg });
            };

            if ((command.ownerOnly && !ownerStatus) || (command.groupOnly && !isGroup) || (command.adminOnly && !adminStatus && !ownerStatus)) return reply('❌ Accès refusé');

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            try {
                await command.execute(sock, msg, args, { from, sender, isGroup, isOwner:ownerStatus, isSupreme, isAdmin:adminStatus, isBotAdmin, prefix, pushName, reply, react:(emoji)=>sock.sendMessage(from,{react:{text:emoji,key:msg.key}}), groupMetadata: isGroup ? await sock.groupMetadata(from) : null });
            } catch (err) {
                console.error(`❌ Execute Error [${commandName}]:`, err);
                reply(`❌ ${toSmallCaps("erreur lors de l'execution de la commande.")}`);
            }
        }

    } catch (err) { console.error("❌ Critical Handler Error:", err); }
};

            // --- HANDLER ANTI-DELETE (PROTOCOLE JSON + KEY) ---
const handleAntiDelete = async (sock, update) => {
    const keys = update.keys || [];
    for (const key of keys) {
        try {
            const from = key.remoteJid;
            // On n'active l'anti-delete que dans les groupes
            if (!from.endsWith('@g.us')) continue;

            const groupSettings = database.getGroupSettings(from) || {};
            if (groupSettings.antidelete === false) continue;

            // Récupération du message dans notre nouvelle DB JSON
            const msgStore = await database.getMessage(key.id);
            if (!msgStore) continue;

            const sender = msgStore.participant; // Celui qui a envoyé le message
            const deleter = update.sender || "ᴜɴᴋɴᴏᴡɴ"; // Celui qui a supprimé le message
            
            // Extraction intelligente du contenu texte
            const content = msgStore.content;
            let messageContent = content.conversation || content.extendedTextMessage?.text;
            
            // Si c'est un média, on met un label stylé
            if (!messageContent) {
                if (content.imageMessage) messageContent = "📷 [ ɪᴍᴀɢᴇ ]";
                else if (content.videoMessage) messageContent = "🎥 [ ᴠɪᴅᴇᴏ ]";
                else if (content.stickerMessage) messageContent = "🗿 [ sᴛɪᴄᴋᴇʀ ]";
                else if (content.audioMessage) messageContent = "🎵 [ ᴀᴜᴅɪᴏ ]";
                else if (content.documentMessage) messageContent = "📄 [ ᴅᴏᴄᴜᴍᴇɴᴛ ]";
                else messageContent = "📦 [ ᴍᴇᴅɪᴀ ]";
            }

            // Design Uniformisé GhostG-X (Gras, SmallCaps)
            let caption = `*╭╼━≪• ${toSmallCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ')} •≫━╾╮*\n`;
            caption += `┃\n`;
            caption += `┃ 👤 *${toSmallCaps('ᴇxᴘᴇᴅɪᴛᴇᴜʀ')}* : @${sender.split('@')[0]}\n`;
            caption += `┃ 🗑️ *${toSmallCaps('sᴜᴘᴘʀɪᴍᴇᴜʀ')}* : @${deleter.split('@')[0]}\n`;
            caption += `┃ 💬 *${toSmallCaps('ᴄᴏɴᴛᴇɴᴜ')}* : _${messageContent}_\n`;
            caption += `┃ 🔑 *${toSmallCaps('ᴋᴇʏ ɪᴅ')}* : \`${key.id}\`\n`;
            caption += `┃\n`;
            caption += `╰━━━━━━━━━━━━━━━━━━━━━╼━╮\n`;
            caption += `💡 *${toSmallCaps('ɪɴғᴏ')}* : ${toSmallCaps('ᴘᴏᴜʀ ʀᴇᴄᴜᴘᴇʀᴇʀ ʟᴇ ᴍᴇᴅɪᴀ, ᴜᴛɪʟɪsᴇᴢ ʟᴀ ᴋᴇʏ ɪᴅ.')}\n`;
            caption += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            // Envoi du message protocole avec les mentions des deux acteurs
            await sock.sendMessage(from, { 
                text: caption, 
                mentions: [sender, deleter] 
            });

        } catch (e) { 
            console.error('❌ AntiDelete Error:', e); 
        }
    }
};


// --- GROUP UPDATE HANDLER (WELCOME / GOODBYE) ---
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const groupSettings = database.getGroupSettings(id) || {};
        const config = global.config; 

        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || toSmallCaps("aucune description.");
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            try {
                const isWelcomeOn = groupSettings.welcome !== undefined ? groupSettings.welcome : config.defaultGroupSettings.welcome;
                if (action === 'add' && isWelcomeOn) {
                    let text = groupSettings.welcomeMessage || config.defaultGroupSettings.welcomeMessage || "Bienvenue @user sur #groupName";
                    text = text.replace(/@user/g, userTag).replace(/#groupName/g, groupName).replace(/#groupDesc/g, groupDesc).replace(/#memberCount/g, metadata.participants.length).replace(/#time/g, time);
                    await sock.sendMessage(id, { text, mentions: [user] });
                }

                const isGoodbyeOn = groupSettings.goodbye !== undefined ? groupSettings.goodbye : config.defaultGroupSettings.goodbye;
                if (action === 'remove' && isGoodbyeOn) {
                    let text = groupSettings.goodbyeMessage || config.defaultGroupSettings.goodbyeMessage || "Au revoir @user !";
                    text = text.replace(/@user/g, userTag).replace(/#groupName/g, groupName).replace(/#memberCount/g, metadata.participants.length).replace(/#time/g, time);
                    await sock.sendMessage(id, { text, mentions: [user] });
                }
            } catch (innerError) {
                console.error(`❌ Welcome/Goodbye individual error for ${user}:`, innerError);
            }
        }
    } catch (e) {
        console.error('❌ Critical Group Update Error:', e);
    }
};

module.exports = { handleMessage, handleGroupUpdate, handleAntiDelete };
