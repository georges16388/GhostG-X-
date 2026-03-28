/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.2 - Full Fusion)
 * Optimized & Fixed - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */
const antideleteCmd = require('./commands/owner/antidelete'); // chemin vers ton module
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const { createStickerBuffer } = require('./utils/sticker'); 

// --- SYSTÈME ANTI-RÉPÉTITION & COOLDOWN ---
const processedMessages = new Set();
const reactionCooldown = new Map();

// Nettoyage de la mémoire toutes les 10 minutes pour éviter les fuites RAM
setInterval(() => processedMessages.clear(), 10 * 60 * 1000);

/**
 * INITIALISATION DES COMMANDES (GLOBAL)
 */
global.commands = loadCommands();

/**
 * UTILITAIRES DE VÉRIFICATION
 */
const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const isAdmin = async (sock, participant, groupId) => {
    if (!groupId || !groupId.endsWith('@g.us')) return false;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const p = metadata.participants.find(v => normalizeJid(v.id) === normalizeJid(participant));
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

/**
 * GESTIONNAIRE DE MESSAGES PRINCIPAL
 */
const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        // --- 🛡️ PROTECTION ANTI-DUPLICATION & VIEUX MESSAGES ---
        const messageTimestamp = msg.messageTimestamp; 
        const now = Math.floor(Date.now() / 1000);
        if (now - messageTimestamp > 15) return; 

        if (processedMessages.has(msg.key.id)) return;
        processedMessages.add(msg.key.id);

        // --- VARIABLES DE BASE ---
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const config = global.config;
        const prefix = config.prefix || '.';

        const getText = (m) => {
            return m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption ||
                   m?.videoMessage?.caption || m?.buttonsResponseMessage?.selectedButtonId ||
                   m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   m?.templateButtonReplyMessage?.selectedId || "";
        };

        const body = getText(msg.message).trim();
        const ownerStatus = global.isOwner(sender);
        const isSupreme = global.isSupreme(sender);

        // --- SÉCURITÉ SELF-MODE ---
        if (config.selfMode && !ownerStatus && !msg.key.fromMe) return;

        // --- 🕹️ SYSTÈME TIC-TAC-TOE (ISOLÉ) ---
        try {
            const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
            const tttResult = await handleTicTacToeMove(sock, msg, { sender, from, body });
            if (tttResult) return; 
        } catch (e) {
            console.error("❌ TicTacToe Handler Error:", e);
        }

        // --- DÉTECTION PRÉFIXE ET COMMANDE ---
        let activePrefix = prefix;
        if (isSupreme && body.startsWith('>')) activePrefix = '>';

        const isCmd = body.startsWith(activePrefix);
        const commandName = isCmd ? body.slice(activePrefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : body.trim().split(/\s+/);

        const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;
        const isBotAdmin = isGroup ? await isAdmin(sock, sock.user.id, from) : false;

        // --- 🎭 SYSTÈME DE RÉACTIONS AUTOMATIQUES (ISOLÉ) ---
        try {
            if (config.autoReact && canReact(from)) {
                if (isCmd) {
                    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
                } 
                else if (ownerStatus) {
                    await sock.sendMessage(from, { react: { text: config.supremeReact || '👑', key: msg.key } });
                }
                else if (!msg.key.fromMe && body) {
                    const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '😉', '😍', '✝️', '😏', '😎', '🫂', '👋🏾', '❓', '💩', '😊'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } });
                }
            }
        } catch (e) { /* On ignore silencieusement les erreurs de réaction */ }

        // --- 🛡️ SYSTÈME ANTI-GROUP MENTION (ISOLÉ) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.antigroupmention) {
                    const isMentioningAll = body.includes('@everyone') || 
                                            body.includes('@all') || 
                                            msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 10;

                    if (isMentioningAll && isBotAdmin) {
                        const action = groupSettings.antigroupmentionaction || 'delete';
                        await sock.sendMessage(from, { delete: msg.key });

                        if (action === 'kick') {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            await sock.sendMessage(from, { 
                                text: `*╭╼━≪• ${toSmallCaps('ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ')} •≫━╾╮*\n*┃*\n*┃* 🚫 *${toSmallCaps('ᴜsᴇʀ ᴋɪᴄᴋᴇᴅ')}*\n*┃* 📝 *${toSmallCaps('ʀᴇᴀsᴏɴ')}* : *${toSmallCaps('ᴍᴇɴᴛɪᴏɴ ɪɴᴛᴇʀᴅɪᴛᴇ')}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*`
                            });
                        } else {
                            await sock.sendMessage(from, { 
                                text: `⚠️ @${sender.split('@')[0]} *${toSmallCaps('les mentions de groupe sont interdites ici.')}*`,
                                mentions: [sender]
                            });
                        }
                        return; 
                    }
                }
            } catch (e) {
                console.error("❌ AGM Logic Error:", e);
            }
        }

        // --- 🛡️ SYSTÈME ANTI-LINK (ISOLÉ) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.antilink) {
                    const linkPattern = /chat.whatsapp.com\/(?:invite\/)?([0-9a-zA-Z]{20,26})/i;
                    const linked = body.match(linkPattern);

                    if (linked && isBotAdmin) { 
                        const groupInvite = await sock.groupInviteCode(from).catch(() => null);
                        if (!(groupInvite && linked[0].includes(groupInvite))) {
                            const action = groupSettings.antilinkAction || 'delete';
                            await sock.sendMessage(from, { delete: msg.key });

                            if (action === 'kick') {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                await sock.sendMessage(from, { 
                                    text: `*╭╼━≪• ${toSmallCaps('ᴀɴᴛɪ-ʟɪɴᴋ sᴇᴄᴜʀɪᴛʏ')} •≫━╾╮*\n*┃*\n*┃* 🚫 *${toSmallCaps('ᴜsᴇʀ ᴋɪᴄᴋᴇᴅ')}*\n*┃* 📝 *${toSmallCaps('ʀᴇᴀsᴏɴ')}* : *${toSmallCaps('ᴘᴜʙʟɪᴄɪᴛᴇ ɪɴᴛᴇʀᴅɪᴛᴇ')}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*`
                                });
                            } else {
                                await sock.sendMessage(from, { 
                                    text: `⚠️ @${sender.split('@')[0]} *${toSmallCaps('les liens ne sont pas autorisés ici.')}*`,
                                    mentions: [sender]
                                });
                            }
                            return; 
                        }
                    }
                }
            } catch (e) {
                console.error("❌ Anti-Link Logic Error:", e);
            }
        }

        // --- 🎨 SYSTÈME AUTO-STICKER (ISOLÉ) ---
        const isMedia = msg.message?.imageMessage || msg.message?.videoMessage;
        if (isGroup && isMedia && !isCmd) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.autosticker) {
                    if (msg.message?.imageMessage || (msg.message?.videoMessage && msg.message?.videoMessage?.seconds <= 10)) {
                        await sock.sendMessage(from, { react: { text: '🪄', key: msg.key } });
                        const quota = msg.message.imageMessage ? 'image' : 'video';
                        const stream = await downloadContentFromMessage(msg.message[`${quota}Message`], quota);
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                        const stickerBuffer = await createStickerBuffer(buffer, {
                            pack: "ɢʜᴏsᴛɢ-x ᴍᴅ",
                            author: pushName
                        });
                        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                    }
                }
            } catch (e) { 
                console.error('❌ AutoSticker Error:', e); 
            }
        }

        // --- 🧠 GHOSTG INTEL SYSTEM (ISOLÉ) ---
        try {
            global.ghostgMode = global.ghostgMode || 'off'; 
            if (global.ghostgMode !== 'off' && ownerStatus && !isCmd && body) {
                const ghostgCmd = global.commands.get('ghostg');
                if (ghostgCmd) {
                    const extra = {
                        from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, isBotAdmin, prefix, pushName,
                        reply: (text) => sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg }),
                        react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                        groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                    };
                    return ghostgCmd.execute(sock, msg, args, extra);
                }
            }
        } catch (e) {
            console.error("❌ GhostG Intel Error:", e);
        }

        // Ajout des stats de groupe
        try {
            if (isGroup && typeof addMessage === 'function') addMessage(from, sender);
        } catch (e) {}

        // --- 🚀 EXÉCUTION DES COMMANDES (SÉCURISÉE) ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName) || [...global.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            if (!command) return;

            const reply = (text) => {
                return sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg });
            };

            if (command.ownerOnly && !ownerStatus) return reply(config.messages.ownerOnly);
            if (command.groupOnly && !isGroup) return reply(config.messages.groupOnly);
            if (command.adminOnly && !adminStatus && !ownerStatus) return reply(config.messages.adminOnly);

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, isBotAdmin, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                });
            } catch (err) {
                console.error(`❌ Execute Error [Command: ${commandName}]:`, err);
                reply(`❌ *${toSmallCaps("erreur lors de l'execution de la commande.")}*`);
            }
        }
    } catch (err) { 
        console.error('❌ Critical Handler Error:', err); 
    }
};

/**
 * GESTIONNAIRE DE GROUPES (ISOLÉ ET SÉCURISÉ)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings(id) || { welcome: true, goodbye: true };
        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || toSmallCaps("aucune description.");
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            try {
                if (action === 'add' && settings.welcome) {
                    let welcomeText = settings.welcomeMessage || global.config.defaultGroupSettings.welcomeMessage;
                    welcomeText = welcomeText.replace(/@user/g, userTag)
                                             .replace(/#groupName/g, groupName)
                                             .replace(/#groupDesc/g, groupDesc)
                                             .replace(/#memberCount/g, metadata.participants.length)
                                             .replace(/#time/g, time);
                    await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
                }

                if (action === 'remove' && settings.goodbye) {
                    let goodbyeText = settings.goodbyeMessage || global.config.defaultGroupSettings.goodbyeMessage;
                    goodbyeText = goodbyeText.replace(/@user/g, userTag)
                                             .replace(/#memberCount/g, metadata.participants.length)
                                             .replace(/#time/g, time);
                    await sock.sendMessage(id, { text: goodbyeText, mentions: [user] });
                }
            } catch (msgErr) {
                console.error(`❌ Erreur envoi Welcome/Goodbye pour ${user}:`, msgErr);
            }
        }
    } catch (e) { 
        console.error('❌ Critical Group Update Error:', e); 
    }
};

// --- 🛡️ SYSTÈME ANTI-DELETE (GROUPES + PRIVÉ) ---
try {
    sock.ev.on('messages.delete', async (update) => {
        const keys = update.keys || [];
        for (const key of keys) {
            const from = key.remoteJid;
            const isGroup = from.endsWith('@g.us');

            // Récupérer les settings
            const groupSettings = database.getGroupSettings(from) || {};
            const active = groupSettings.antidelete || true; // par défaut on active pour privé aussi

            if (!active) continue;

            // Récupérer le message supprimé
            const msgStore = await global.store.loadMessage(from, key.id);
            if (!msgStore || !msgStore.message) continue;

            const sender = msgStore.key.participant || msgStore.key.remoteJid;
            const pushName = msgStore.pushName || 'ᴜsᴇʀ';
            const mediaType = msgStore.message.imageMessage
                ? 'image'
                : msgStore.message.videoMessage
                ? 'video'
                : msgStore.message.audioMessage
                ? 'audio'
                : msgStore.message.stickerMessage
                ? 'sticker'
                : null;

            const getMessage = (id) => global.store.loadMessage(from, id);

            // Exécuter ton module anti-delete
            await antideleteCmd.execute(sock, msgStore, [], {
                from,
                reply: (text) => sock.sendMessage(from, { text }, { quoted: msgStore }),
                toSmallCaps,
                sender,
                pushName,
                getMessage,
                mediaType
            });
        }
    });
} catch (err) {
    console.error('❌ AntiDelete Handler Error:', err);
}
module.exports = { handleMessage, handleGroupUpdate };
