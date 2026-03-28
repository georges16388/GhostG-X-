/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.2 - Full Fusion)
 * Optimized & Fixed - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const database = require('./database'); 
// ⚠️ MODIFIÉ ICI : Chemins mis à jour vers le dossier utils
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
// ⚠️ MODIFIÉ ICI : Importation de createStickerBuffer au lieu de sticker
const { createStickerBuffer } = require('./utils/sticker'); 

// --- SYSTÈME ANTI-RÉPÉTITION & COOLDOWN ---
const processedMessages = new Set();
const reactionCooldown = new Map();

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

        // --- 🛡️ PROTECTION ANTI-DUPLICATION ---
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
        // Note: On ne "return" pas tout de suite si body est vide pour laisser passer les médias (AutoSticker)

        const ownerStatus = global.isOwner(sender);
        const isSupreme = global.isSupreme(sender);

        // --- SÉCURITÉ SELF-MODE ---
        if (config.selfMode && !ownerStatus && !msg.key.fromMe) return;

        // --- SYSTÈME TIC-TAC-TOE ---
        const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
        const tttResult = await handleTicTacToeMove(sock, msg, { sender, from, body });
        if (tttResult) return; 

        // --- DÉTECTION PRÉFIXE ET COMMANDE ---
        let activePrefix = prefix;
        if (isSupreme && body.startsWith('>')) activePrefix = '>';

        const isCmd = body.startsWith(activePrefix);
        const commandName = isCmd ? body.slice(activePrefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : body.trim().split(/\s+/);

        const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

        // --- 🎭 SYSTÈME DE RÉACTIONS AUTOMATIQUES (OPTIMISÉ) ---
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

        // --- 🛡️ SYSTÈME ANTI-GROUP MENTION (AGM LOGIC) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            const groupSettings = database.getGroupSettings(from) || {};
            if (groupSettings.antigroupmention) {
                const isMentioningAll = body.includes('@everyone') || 
                                        body.includes('@all') || 
                                        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 10;

                if (isMentioningAll) {
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
        }

        // --- 🛡️ SYSTÈME ANTI-LINK (LOGIQUE DE DÉTECTION) ---
        if (isGroup && !ownerStatus && !adminStatus) {
            const groupSettings = database.getGroupSettings(from) || {};
            if (groupSettings.antilink) {
                const linkPattern = /chat.whatsapp.com\/(?:invite\/)?([0-9a-zA-Z]{20,26})/i;
                const linked = body.match(linkPattern);

                if (linked) {
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
        }

        // --- 🎨 SYSTÈME AUTO-STICKER ---
        const isMedia = msg.message?.imageMessage || msg.message?.videoMessage;
        if (isGroup && isMedia && !isCmd) {
            const groupSettings = database.getGroupSettings(from) || {};
            if (groupSettings.autosticker) {
                // Petit correctif : Ajout de la tolérance pour les images en plus des vidéos de moins de 10s
                if (msg.message?.imageMessage || (msg.message?.videoMessage && msg.message?.videoMessage?.seconds <= 10)) {
                    try {
                        await sock.sendMessage(from, { react: { text: '🪄', key: msg.key } });
                        const quota = msg.message.imageMessage ? 'image' : 'video';
                        const stream = await downloadContentFromMessage(msg.message[`${quota}Message`], quota);
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                        // ⚠️ MODIFIÉ ICI : Utilisation de createStickerBuffer
                        const stickerBuffer = await createStickerBuffer(buffer, {
                            pack: "ɢʜᴏsᴛɢ-x ᴍᴅ",
                            author: pushName
                        });
                        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                    } catch (e) { console.error('AutoSticker Error:', e); }
                }
            }
        }

        // --- GHOSTG INTEL SYSTEM ---
        global.ghostgMode = global.ghostgMode || 'off'; 
        if (global.ghostgMode !== 'off' && ownerStatus && !isCmd && body) {
            const ghostgCmd = global.commands.get('ghostg');
            if (ghostgCmd) {
                const extra = {
                    from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, prefix, pushName,
                    reply: (text) => sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg }),
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                };
                return ghostgCmd.execute(sock, msg, args, extra);
            }
        }

        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // --- EXÉCUTION DES COMMANDES ---
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
                    from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null,
                    isBotAdmin: isGroup ? await isAdmin(sock, sock.user.id, from) : false
                });
            } catch (err) {
                console.error('Execute Error:', err);
                reply(`❌ *${toSmallCaps("erreur lors de l'execution de la commande.")}*`);
            }
        }
    } catch (err) { console.error('Handler Error:', err); }
};

/**
 * GESTIONNAIRE DE GROUPES
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
        }
    } catch (e) { console.error('Group Update Error:', e); }
};

module.exports = { handleMessage, handleGroupUpdate };
