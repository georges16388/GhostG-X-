const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const database = require('./database');
const groupStats = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const { createStickerBuffer } = require('./utils/sticker');

// ============================================================
// SYSTÈME ANTI-RÉPÉTITION & COOLDOWN
// ============================================================
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

// ============================================================
// SYSTÈME ANTI-SPAM / ANTI-FLOOD
// ============================================================
const spamTracker = new Map(); // { jid: { count, firstMsg, warned } }
const SPAM_LIMIT = 5;           // max messages
const SPAM_WINDOW = 4000;       // en 4 secondes
const SPAM_MUTE_DURATION = 60;  // secondes de mute

const checkSpam = (jid) => {
    const now = Date.now();
    const data = spamTracker.get(jid) || { count: 0, firstMsg: now, warned: false };
    if (now - data.firstMsg > SPAM_WINDOW) {
        spamTracker.set(jid, { count: 1, firstMsg: now, warned: false });
        return false;
    }
    data.count++;
    spamTracker.set(jid, data);
    return data.count >= SPAM_LIMIT;
};

const isSpamWarned = (jid) => spamTracker.get(jid)?.warned || false;
const markSpamWarned = (jid) => {
    const d = spamTracker.get(jid) || {};
    spamTracker.set(jid, { ...d, warned: true });
};

// Nettoyage spam tracker toutes les 2 minutes
setInterval(() => {
    const now = Date.now();
    for (const [jid, data] of spamTracker) {
        if (now - data.firstMsg > SPAM_WINDOW * 5) spamTracker.delete(jid);
    }
}, 120000);

// ============================================================
// INITIALISATION DES COMMANDES
// ============================================================
global.commands = loadCommands();

// ============================================================
// CACHE METADATA GROUPE (évite les appels réseau répétés)
// ============================================================
const metadataCache = new Map();
const METADATA_TTL = 5 * 60 * 1000; // 5 minutes

const getGroupMetadata = async (sock, groupId) => {
    const cached = metadataCache.get(groupId);
    if (cached && Date.now() - cached.ts < METADATA_TTL) return cached.data;
    const data = await sock.groupMetadata(groupId);
    metadataCache.set(groupId, { data, ts: Date.now() });
    return data;
};

// ============================================================
// UTILITAIRES
// ============================================================
const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

// ✅ FIX MULTI-DEVICE : supprime le suffixe :7 avant extraction
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');
};

const toSmallCaps = (text) => {
    const fonts = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
        'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
        'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
        'y':'ʏ','z':'ᴢ'
    };
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// ✅ isAdmin utilise le cache metadata + normalizeJid
const isAdmin = async (sock, participant, groupId) => {
    if (!groupId?.endsWith('@g.us')) return false;
    try {
        const metadata = await getGroupMetadata(sock, groupId);
        const participantNorm = normalizeJid(participant);
        const p = metadata.participants.find(v => normalizeJid(v.id) === participantNorm);
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

// ============================================================
// NOTIFICATION CRASH AU OWNER (VPS 24/7)
// ============================================================
let _sockRef = null; // référence globale pour les notifications crash

const notifyOwnerCrash = async (context, err) => {
    try {
        if (!_sockRef || !global.config?.supremeNumber) return;
        const ownerJid = `${global.config.supremeNumber}@s.whatsapp.net`;
        const msg = `🚨 *ɢʜᴏsᴛɢ-x ᴄʀᴀꜱʜ ᴀʟᴇʀᴛ*\n\n` +
                    `📍 *Contexte* : ${context}\n` +
                    `❌ *Erreur* : ${err?.message || err}\n` +
                    `🕐 *Heure* : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ouagadougou' })}\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        await _sockRef.sendMessage(ownerJid, { text: msg });
    } catch {}
};

// ============================================================
// AUTO-REACT INTELLIGENT
// ============================================================
const getSmartReaction = (body, ownerStatus, isSupreme, isCmd, fromMe, config) => {
    if (fromMe) return null;
    if (isSupreme) return config.supremeReact || '👑';
    if (ownerStatus) return '🌟';

    // Détection d'intention par mots-clés
    const b = body.toLowerCase();
    if (b.match(/merci|thanks|thank you|🙏/)) return '❤️';
    if (b.match(/bonjour|bonsoir|salut|hello|hi|hey/)) return '👋🏾';
    if (b.match(/lol|😂|haha|mdr|ptdr/)) return '😂';
    if (b.match(/wow|waoh|incroyable|amazing/)) return '🔥';
    if (b.match(/rip|mort|dead|💀/)) return '💀';
    if (b.match(/love|amour|❤️|😍/)) return '😍';
    if (b.match(/non|no|jamais|never/)) return '😏';
    if (b.match(/oui|yes|ok|d\'accord/)) return '✅';
    if (isCmd) return '⚡';

    // Réaction aléatoire si rien ne correspond
    const emojis = ['⚡','🔥','✨','❤️','🙏🏾','😉','✝️','😎','🫂','💫','🌟','💎'];
    return emojis[Math.floor(Math.random() * emojis.length)];
};

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
const handleMessage = async (sock, msg) => {
    // Sauvegarde référence socket pour notifications crash
    if (!_sockRef) _sockRef = sock;

    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        database.saveMessage(msg);

        // Anti-duplication
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

        // Extraction du texte
        const getText = (m) =>
            m?.conversation ||
            m?.extendedTextMessage?.text ||
            m?.imageMessage?.caption ||
            m?.videoMessage?.caption ||
            m?.buttonsResponseMessage?.selectedButtonId ||
            m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m?.templateButtonReplyMessage?.selectedId ||
            m?.pollUpdateMessage?.pollUpdate?.name ||
            m?.interactiveResponseMessage?.body?.text || "";

        const body = getText(msg.message).trim();

        // ✅ Guard fromMe : ignore les messages envoyés par le bot lui-même
        // (évite les boucles de réponse sur certaines commandes)
        if (msg.key.fromMe) return;

        // ✅ Vérification owner/supreme avec fix multi-device
        const senderNorm = normalizeJid(sender);
        const supremeNorm = String(global.config.supremeNumber).replace(/\D/g, '');
        const ownerNumbers = Array.isArray(global.config.ownerNumber)
            ? global.config.ownerNumber
            : [global.config.ownerNumber];

        const isSupreme = senderNorm === supremeNorm;
        const ownerStatus = isSupreme || ownerNumbers.some(o => String(o).replace(/\D/g, '') === senderNorm);

        // Préfixe & parsing commande
        let activePrefix = prefix;
        if (isSupreme && body.startsWith('>')) activePrefix = '>';
        const isCmd = body.startsWith(activePrefix);
        const commandName = isCmd ? body.slice(activePrefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : body.trim().split(/\s+/);

        // ✅ Une seule récupération metadata pour tout le message
        const groupMetadata = isGroup ? await getGroupMetadata(sock, from).catch(() => null) : null;
        const adminStatus = isGroup && groupMetadata
            ? (() => {
                const norm = normalizeJid(sender);
                const p = groupMetadata.participants.find(v => normalizeJid(v.id) === norm);
                return p?.admin === 'admin' || p?.admin === 'superadmin';
              })()
            : false;
        const isBotAdmin = isGroup && groupMetadata
            ? (() => {
                const norm = normalizeJid(sock.user.id);
                const p = groupMetadata.participants.find(v => normalizeJid(v.id) === norm);
                return p?.admin === 'admin' || p?.admin === 'superadmin';
              })()
            : false;

        // ============================================================
        // PROTECTIONS GROUPE — actives même en selfMode
        // (antispam, antilink, etc. protègent le groupe indépendamment)
        // ============================================================

        // ANTI-SPAM / FLOOD
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                if (checkSpam(sender)) {
                    if (!isSpamWarned(sender) && isBotAdmin) {
                        markSpamWarned(sender);
                        await sock.sendMessage(from, {
                            text: `⚠️ @${senderNorm} *${toSmallCaps('flood détecté — tu es muté 60 secondes.')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
                            mentions: [sender]
                        });
                        await sock.groupParticipantsUpdate(from, [sender], 'demote').catch(() => {});
                        setTimeout(async () => { spamTracker.delete(sender); }, SPAM_MUTE_DURATION * 1000);
                    }
                    return;
                }
            } catch (e) { console.error("❌ Anti-Spam Error:", e); }
        }

        // ============================================================
        // ANTI-MENTION DE MASSE — actif même en selfMode
        // ============================================================
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

        // ============================================================
        // ANTI-LINK — actif même en selfMode
        // ============================================================
        if (isGroup && !ownerStatus && !adminStatus) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.antilink) {
                    const linkPattern = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9a-zA-Z]{20,26}|bit\.ly\/\w+)/i;
                    if (body.match(linkPattern) && isBotAdmin) {
                        await sock.sendMessage(from, { delete: msg.key });
                        await sock.sendMessage(from, {
                            text: `🚫 @${senderNorm} *${toSmallCaps('lien whatsapp interdit dans ce groupe.')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
                            mentions: [sender]
                        });
                        return;
                    }
                }
            } catch (e) { console.error("❌ Anti-Link Error:", e); }
        }

        // ── ANTI-GROUP STATUS — actif même en selfMode ──
        if (isGroup && isBotAdmin && !ownerStatus && !adminStatus) {
            try {
                const antigsCmd = global.commands.get('antigstatus');
                if (antigsCmd?.checkAndHandle) {
                    await antigsCmd.checkAndHandle(sock, msg, { from, sender, isBotAdmin, database });
                }
            } catch (e) { console.error('❌ AntiGStatus Error:', e); }
        }

        // ============================================================
        // ✅ SELFMODE : bloque commandes + features pour les non-owners
        // Les protections groupe ci-dessus restent actives (antispam, antilink, etc.)
        // ============================================================
        if (config.selfMode && !ownerStatus) return;

        // --- TIC-TAC-TOE ---
        try {
            const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
            if (await handleTicTacToeMove(sock, msg, { sender, from, body })) return;
        } catch (e) { console.error("❌ TicTacToe Error:", e); }
        // ============================================================
        // AUTO-STICKER
        // ============================================================
        const isMedia = msg.message?.imageMessage || msg.message?.videoMessage;
        if (isGroup && isMedia && !isCmd) {
            try {
                const groupSettings = database.getGroupSettings(from) || {};
                if (groupSettings.autosticker) {
                    const mediaKey = msg.message.imageMessage ? 'imageMessage' : 'videoMessage';
                    const stream = await downloadContentFromMessage(msg.message[mediaKey], mediaKey.replace('Message', ''));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    const stickerBuffer = await createStickerBuffer(buffer, { pack: "ɢʜᴏsᴛɢ-x ᴍᴅ", author: pushName });
                    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                }
            } catch (e) { console.error("❌ AutoSticker Error:", e); }
        }

        // ============================================================
        // GHOSTG INTEL (NLP)
        // ============================================================
        try {
            global.ghostgMode = global.ghostgMode || 'off';
            if (global.ghostgMode !== 'off' && ownerStatus && !isCmd && body) {
                const ghostgCmd = global.commands.get('ghostg');
                if (ghostgCmd) {
                    const nlpArgs = body.trim().split(/\s+/);
await ghostgCmd.execute(sock, msg, nlpArgs, {
    from, sender, isGroup,
    isOwner: ownerStatus, isSupreme, isAdmin: adminStatus,
    isBotAdmin, prefix, pushName, groupMetadata,
    body,
    reply: (text) => sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg }),
    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
});
                }
            }
        } catch (e) { console.error("❌ GhostG Intel Error:", e); }

        // Stats groupe
        if (isGroup) {
            try { groupStats.addMsg(from, sender); } catch {}
        }

        // ============================================================
        // REPLY AVEC SIGNATURE
        // ============================================================
        const reply = (text) => {
            const sig = `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
            const finalMsg = text.includes('ᴘᴏᴡᴇʀᴇᴅ ʙʏ') ? text : `${text}${sig}`;
            return sock.sendMessage(from, { text: finalMsg }, { quoted: msg });
        };

        // ============================================================
        // EXÉCUTION COMMANDE
        // ============================================================
        if (isCmd && commandName) {
            const command = global.commands.get(commandName);
            if (!command) return;

            if (command.ownerOnly && !ownerStatus)
                return reply(`👑 ${toSmallCaps('accès refusé : réservé au maître suprême.')}`);
            if (command.groupOnly && !isGroup)
                return reply(`👥 ${toSmallCaps('cette commande fonctionne uniquement en groupe.')}`);
            if (command.adminOnly && !adminStatus && !ownerStatus)
                return reply(`🛡️ ${toSmallCaps('accès refusé : réservé aux admins.')}`);
            if (command.botAdminOnly && !isBotAdmin)
                return reply(`🤖 ${toSmallCaps('le bot doit être admin pour exécuter cette commande.')}`);
            if (command.privateOnly && isGroup)
                return reply(`💬 ${toSmallCaps('cette commande fonctionne uniquement en privé.')}`);

            if (config.autoTyping) {
                await sock.sendPresenceUpdate('composing', from).catch(() => {});
            }

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup,
                    isOwner: ownerStatus, isSupreme,
                    isAdmin: adminStatus, isBotAdmin,
                    prefix, pushName, reply, groupMetadata,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
                });
            } catch (err) {
                console.error(`❌ Execute Error [${commandName}]:`, err);
                await notifyOwnerCrash(`Commande: ${commandName}`, err);
                reply(`❌ ${toSmallCaps("erreur lors de l'exécution. le développeur a été notifié.")}`);
            }
        }

    } catch (err) {
        console.error("❌ Critical Handler Error:", err);
        await notifyOwnerCrash("handleMessage global", err);
    }
};

// ============================================================
// HANDLER ANTI-DELETE PUISSANT
// ============================================================
const handleAntiDelete = async (sock, update) => {
    if (!_sockRef) _sockRef = sock;
    const keys = update.keys || [];

    for (const key of keys) {
        try {
            const from = key.remoteJid;
            if (!from.endsWith('@g.us')) continue;

            // Ignore les suppressions du bot lui-même
            const deleter = update.sender || null;
            const botNorm = normalizeJid(sock.user.id);
            if (deleter && normalizeJid(deleter) === botNorm) continue;

            const groupSettings = database.getGroupSettings(from) || {};
            if (groupSettings.antidelete === false) continue;

            const msgStore = await database.getMessage(key.id);
            if (!msgStore) continue;

            const sender = msgStore.participant || msgStore.key?.participant || "ɪɴᴄᴏɴɴᴜ@s.whatsapp.net";
            const content = msgStore.content || {};

            let messageContent = content.conversation || content.extendedTextMessage?.text;
            let mediaBuffer = null;
            let mediaType = null;

            if (!messageContent) {
                if (content.imageMessage) { messageContent = "📷 [ ɪᴍᴀɢᴇ ]"; mediaType = 'image'; }
                else if (content.videoMessage) { messageContent = "🎥 [ ᴠɪᴅᴇᴏ ]"; mediaType = 'video'; }
                else if (content.stickerMessage) { messageContent = "🗿 [ sᴛɪᴄᴋᴇʀ ]"; mediaType = 'sticker'; }
                else if (content.audioMessage) { messageContent = "🎵 [ ᴀᴜᴅɪᴏ ]"; mediaType = 'audio'; }
                else if (content.documentMessage) { messageContent = `📄 [ ${content.documentMessage.fileName || 'ᴅᴏᴄᴜᴍᴇɴᴛ'} ]`; }
                else messageContent = "📦 [ ᴍᴇᴅɪᴀ ɪɴᴄᴏɴɴᴜ ]";
            }

            // Tentative de récupération du média
            if (mediaType && ['image', 'video', 'audio', 'sticker'].includes(mediaType)) {
                try {
                    const mediaKey = `${mediaType}Message`;
                    const stream = await downloadContentFromMessage(content[mediaKey], mediaType);
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    if (buf.length > 0) mediaBuffer = buf;
                } catch {}
            }

            const senderNum = sender.split('@')[0];
            const deleterNum = deleter ? deleter.split('@')[0] : 'ɪɴᴄᴏɴɴᴜ';
            const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

            const caption =
                `*╭╼━≪• 🗑️ ${toSmallCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ')} •≫━╾╮*\n` +
                `┃\n` +
                `┃ 👤 *${toSmallCaps('ᴇxᴘᴇᴅɪᴛᴇᴜʀ')}* : @${senderNum}\n` +
                `┃ 🗑️ *${toSmallCaps('sᴜᴘᴘʀɪᴍᴇᴜʀ')}* : @${deleterNum}\n` +
                `┃ 💬 *${toSmallCaps('ᴄᴏɴᴛᴇɴᴜ')}* : _${messageContent}_\n` +
                `┃ ⏰ *${toSmallCaps('ʜᴇᴜʀᴇ')}* : ${time}\n` +
                `┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━╼\n` +
                `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            const mentions = [sender];
            if (deleter) mentions.push(deleter);

            // Envoie le média récupéré si possible, sinon juste le texte
            if (mediaBuffer && mediaType === 'image') {
                await sock.sendMessage(from, { image: mediaBuffer, caption, mentions });
            } else if (mediaBuffer && mediaType === 'video') {
                await sock.sendMessage(from, { video: mediaBuffer, caption, mentions });
            } else if (mediaBuffer && mediaType === 'audio') {
                await sock.sendMessage(from, { text: caption, mentions });
                await sock.sendMessage(from, { audio: mediaBuffer, mimetype: 'audio/mp4' });
            } else if (mediaBuffer && mediaType === 'sticker') {
                await sock.sendMessage(from, { text: caption, mentions });
                await sock.sendMessage(from, { sticker: mediaBuffer });
            } else {
                await sock.sendMessage(from, { text: caption, mentions });
            }

        } catch (e) {
            console.error('❌ AntiDelete Error:', e);
            await notifyOwnerCrash("handleAntiDelete", e);
        }
    }
};

// ============================================================
// GROUP UPDATE HANDLER — WELCOME / GOODBYE STYLÉ
// ============================================================
const handleGroupUpdate = async (sock, update) => {
    if (!_sockRef) _sockRef = sock;
    const { id, participants, action } = update;

    try {
        const groupSettings = database.getGroupSettings(id) || {};
        const config = global.config;
        const metadata = await getGroupMetadata(sock, id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || toSmallCaps("aucune description.");
        const memberCount = metadata.participants.length;
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });
        const date = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userNum = user.split('@')[0];
            const userTag = `@${userNum}`;

            try {
                // ✅ WELCOME STYLÉ
                const isWelcomeOn = groupSettings.welcome !== undefined
                    ? groupSettings.welcome
                    : config.defaultGroupSettings.welcome;

                if (action === 'add' && isWelcomeOn) {
                    let text = groupSettings.welcomeMessage ||
                        config.defaultGroupSettings.welcomeMessage ||
                        `*╭╼━≪• ✨ ʙɪᴇɴᴠᴇɴᴜᴇ ✨ •≫━╾╮*\n` +
                        `┃ 👥 *ɢʀᴏᴜᴘᴇ* : #groupName\n` +
                        `┃ 👋🏾 *ᴍᴇᴍʙʀᴇ* : @user\n` +
                        `┃ 📝 *ᴅᴇsᴄ* : #groupDesc\n` +
                        `┃ 👤 *ᴍᴇᴍʙʀᴇs* : #memberCount\n` +
                        `┃ 📅 *ᴅᴀᴛᴇ* : #date\n` +
                        `┃ ⏰ *ʜᴇᴜʀᴇ* : #time\n` +
                        `┃ 🛡️ ʀᴇsᴘᴇᴄᴛᴇ ʟᴇs ʀᴇɢʟᴇs\n` +
                        `┃ ❤️ ᴊᴇsᴜs ᴛ'ᴀɪᴍᴇ\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                    text = text
                        .replace(/@user/g, userTag)
                        .replace(/#groupName/g, groupName)
                        .replace(/#groupDesc/g, groupDesc)
                        .replace(/#memberCount/g, memberCount)
                        .replace(/#time/g, time)
                        .replace(/#date/g, date);

                    await sock.sendMessage(id, { text, mentions: [user] });
                }

                // ✅ GOODBYE STYLÉ
                const isGoodbyeOn = groupSettings.goodbye !== undefined
                    ? groupSettings.goodbye
                    : config.defaultGroupSettings.goodbye;

                if (action === 'remove' && isGoodbyeOn) {
                    let text = groupSettings.goodbyeMessage ||
                        config.defaultGroupSettings.goodbyeMessage ||
                        `*╭╼━≪• 🥀 ᴀᴜ ʀᴇᴠᴏɪʀ •≫━╾╮*\n` +
                        `┃ 👋🏾 *ᴍᴇᴍʙʀᴇ* : @user\n` +
                        `┃ 🚮 ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs\n` +
                        `┃ 👤 *ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs* : #memberCount\n` +
                        `┃ ⏰ *ʜᴇᴜʀᴇ* : #time\n` +
                        `╰━━━━━━━━━━━━━━━━━╯\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                    text = text
                        .replace(/@user/g, userTag)
                        .replace(/#groupName/g, groupName)
                        .replace(/#memberCount/g, memberCount)
                        .replace(/#time/g, time)
                        .replace(/#date/g, date);

                    await sock.sendMessage(id, { text, mentions: [user] });
                }

            } catch (innerError) {
                console.error(`❌ Welcome/Goodbye error for ${user}:`, innerError);
            }
        }

        // Invalide le cache metadata après un changement de membres
        metadataCache.delete(id);

    } catch (e) {
        console.error('❌ Critical Group Update Error:', e);
        await notifyOwnerCrash("handleGroupUpdate", e);
    }
};

module.exports = { handleMessage, handleGroupUpdate, handleAntiDelete };