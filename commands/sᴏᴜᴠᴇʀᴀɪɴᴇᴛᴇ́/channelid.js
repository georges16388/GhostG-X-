// 🧠 ---------------- GHOSTG-X SUPRÊME NLE (INTELLIGENCE INDÉPENDANTE) ----------------
const input = body.toLowerCase().trim();
const argsNLP = body.split(/\s+/);
const firstWordNLP = argsNLP[0]?.toLowerCase();

if (isMe && global.ghostgMode === 'on' && !body.startsWith(config.prefix)) {
    
    const extraNLP = {
        from, sender, isGroup, groupMetadata,
        isOwner: isMe,
        isAdmin: isMe || await isAdmin(sock, sender, from, groupMetadata),
        isBotAdmin: await isBotAdmin(sock, from, groupMetadata),
        reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
        react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
    };

    // --- 1. DÉTECTION D'INTENTION : INFOS CANAL ---
    // Si tu envoies un lien de canal ou si tu demandes "infos de ce canal"
    if (input.includes("whatsapp.com/channel/") || input.includes("infos canal") || input === "channel") {
        const channelCmd = commands.get('ɪɴғᴏs_ᴄᴀɴᴀʟ') || commands.get('newsletter');
        if (channelCmd) {
            await extraNLP.react('📡');
            // On extrait le lien du texte pour le passer en argument
            const linkMatch = body.match(/https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+/);
            const finalArgs = linkMatch ? [linkMatch[0]] : argsNLP;
            return await channelCmd.execute(sock, msg, finalArgs, extraNLP);
        }
    }

    // --- 2. DÉTECTION D'INTENTION : MÉDIAS & STICKERS ---
    if (/sticker|autocollant|fais un s/i.test(input)) {
        const isMedia = msg.message?.imageMessage || msg.message?.videoMessage || 
                        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        if (isMedia) {
            const sCmd = commands.get('s') || commands.get('sticker');
            if (sCmd) {
                await extraNLP.react('🎨');
                return await sCmd.execute(sock, msg, argsNLP, extraNLP);
            }
        }
    }

    // --- 3. CONVERSATION ET SYSTÈME ---
    if (/^p$|^ping$/i.test(input)) {
        const start = Date.now();
        await extraNLP.react('⚡');
        return await extraNLP.reply(`*ᴘᴏɴɢ !* 📡 *${Date.now() - start}ᴍs*`);
    }

    if (/^m$|^menu$/i.test(input)) {
        const mCmd = commands.get('menu');
        if (mCmd) return await mCmd.execute(sock, msg, [], extraNLP);
    }

    // --- 4. GESTION DE GROUPE PAR INTENTION ---
    if (isGroup) {
        if (/ferme|bloque|verrouille/i.test(input) && input.includes("groupe")) {
            await sock.groupSettingUpdate(from, 'announcement');
            return await extraNLP.reply(`🔒 *sᴀɴᴄᴛᴜᴀɪʀᴇ sᴄᴇʟʟᴇ́.*`);
        }
        if (/ouvre|debloque|deverrouille/i.test(input) && input.includes("groupe")) {
            await sock.groupSettingUpdate(from, 'not_announcement');
            return await extraNLP.reply(`🔓 *ᴘᴀʀᴏʟᴇ ʟɪʙᴇ́ʀᴇ́ᴇ.*`);
        }
        if (/tagall|tous|tout le monde/i.test(input)) {
            const mentions = groupMetadata.participants.map(p => p.id);
            return await sock.sendMessage(from, { text: `*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ ɢᴇ́ɴᴇ́ʀᴀʟᴇ ☬*`, mentions });
        }
    }

    // --- 5. REDIRECTION AUTOMATIQUE (ALIAS ET COMMANDES) ---
    const possibleCmd = commands.get(firstWordNLP) || [...commands.values()].find(c => c.aliases?.includes(firstWordNLP));
    if (possibleCmd) {
        await extraNLP.react('👑');
        return await possibleCmd.execute(sock, msg, argsNLP.slice(1), extraNLP);
    }
}
