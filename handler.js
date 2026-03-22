/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5)
 * Optimized for Self-Response, Memory & Anti-Duplicate
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');

// --- SYSTÈME ANTI-RÉPÉTITION (CACHE) ---
const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 10 * 60 * 1000);

/**
 * Initialisation des Commandes en Global
 */
global.commands = loadCommands();

/**
 * Normalisation des JIDs
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

/**
 * Vérification Propriétaire
 */
const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const supreme = "22651622652"; // Ton numéro maître
    const ownerList = Array.isArray(config.OWNER_NUMBER) ? config.OWNER_NUMBER : [config.OWNER_NUMBER];

    if (senderNumber === supreme) return true;
    return ownerList.some(owner => String(owner).replace(/\D/g, '') === senderNumber);
};

/**
 * Vérification Admin
 */
const isAdmin = async (sock, participant, groupId) => {
    if (!groupId || !groupId.endsWith('@g.us')) return false;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const p = metadata.participants.find(v => normalizeJid(v.id) === normalizeJid(participant));
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

/**
 * GESTIONNAIRE PRINCIPAL
 */
const handleMessage = async (sock, msg) => {
    try {
        // --- FILTRES DE BASE ---
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        // Anti-doublon
        if (processedMessages.has(msg.key.id)) return;
        processedMessages.add(msg.key.id);

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const prefix = config.prefix || '.';

        // Extraction du texte (Prend en compte conversations, images, et messages cités)
        const m = msg.message;
        const getText = (msg) => {
  return msg?.conversation ||
         msg?.extendedTextMessage?.text ||
         msg?.imageMessage?.caption ||
         msg?.videoMessage?.caption ||
         msg?.buttonsResponseMessage?.selectedButtonId ||
         msg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
         msg?.templateButtonReplyMessage?.selectedId ||
         "";
};

const body = getText(msg.message).trim();
const isCmd = body.startsWith(prefix);
        
        

        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];
        const ownerStatus = isOwner(sender);

        // --- 1. SYSTÈME DE RÉACTION ---
        if (config.autoReact) {
            if (ownerStatus && isCmd) {
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } else if (!msg.key.fromMe) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🇧🇫'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        // --- 2. SÉCURITÉ & STATS ---
        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // Anti-Lien
        if (isGroup && !ownerStatus && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // --- 3. EXÉCUTION DES COMMANDES ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) return;

            // Log pro
            console.log(`📩 [ɢʜᴏꜱᴛɢ-x] Commande : ${commandName} | Par : ${pushName} (${sender.split('@')[0]})`);

            // Mode privé global : seul le proprio peut exécuter quoi que ce soit
if (config.selfMode && !ownerStatus) return;

// Permissions spécifiques
const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;
if (command.ownerOnly && !ownerStatus) return;
if (command.groupOnly && !isGroup) return;
if (command.adminOnly && !adminStatus && !ownerStatus) return;
await command.execute(sock, msg, args, { ... });
const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;
            // Check des Permissions
            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup) return; // Pas de reply pour ne pas spammer le PV
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            // Fonction reply avec Signature Prestige
            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*` 
                }, { quoted: msg });
            };

            // Exécution
            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
                });
            } catch (err) {
                console.error(`Erreur commande ${commandName}:`, err);
                reply("❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ ʟᴏʀs ᴅᴇ ʟ'ᴇxᴇ́ᴄᴜᴛɪᴏɴ.*");
            }
        }

    } catch (err) {
        console.error('❌ [HANDLER ERROR]:', err);
    }
};

/**
 * GESTIONNAIRE DE GROUPES (BIENVENUE)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

        for (const user of participants) {
            if (action === 'add' && settings.welcome) {
                const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: @${user.split('@')[0]} 👋🏾\n┃ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️\n╰━━━━━━━━━━━━━━━╯\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                await sock.sendMessage(id, { 
                    text: welcomeText, 
                    mentions: [user],
                    contextInfo: {
                        externalAdReply: {
                            title: "ɢʜᴏꜱᴛɢ-x ᴘʀᴇꜱᴛɪɢᴇ",
                            body: "ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️✝️",
                            mediaType: 1,
                            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                            sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c"
                        }
                    }
                });
            }
        }
    } catch (e) { console.error('Group Update Error:', e); }
};

const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        const { id, from, status } = node[0];
        if (status === 'offer') {
            await sock.rejectCall(id, from);
            await sock.sendMessage(from, { 
                text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*" 
            });
        }
    });
};

module.exports = { 
    handleMessage, 
    handleGroupUpdate, 
    isOwner, 
    initializeAntiCall 
};
