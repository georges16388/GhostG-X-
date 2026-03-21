/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition)
 * Optimized for Memory, Speed & Anti-Duplicate
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');

// --- SYSTÈME ANTI-RÉPÉTITION (CACHE) ---
// Empêche le bot de répondre deux fois au même message (ID de message)
const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 10 * 60 * 1000); // Nettoyage toutes les 10 min

/**
 * Initialisation des Commandes en Global
 */
global.commands = global.commands || loadCommands();

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
    const supreme = String(config.supremeNumber || "22651622652").replace(/\D/g, '');
    const ownerList = Array.isArray(config.OWNER_NUMBER) ? config.OWNER_NUMBER : [config.OWNER_NUMBER];

    if (senderNumber === supreme) return true;
    return ownerList.some(owner => String(owner).replace(/\D/g, '') === senderNumber);
};

/**
 * Vérification Admin
 */
const isAdmin = async (sock, participant, groupId) => {
    if (!groupId.endsWith('@g.us')) return false;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const p = metadata.participants.find(v => v.id.split('@')[0] === participant.split('@')[0]);
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
        
        // Anti-doublon critique : On ne traite pas deux fois le même ID
        if (processedMessages.has(msg.key.id)) return;
        processedMessages.add(msg.key.id);

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';

        // Extraction intelligente du contenu
        const m = msg.message;
        const content = m.conversation || 
                        m.extendedTextMessage?.text || 
                        m.imageMessage?.caption || 
                        m.videoMessage?.caption || 
                        m.documentWithCaptionMessage?.message?.documentMessage?.caption || "";

        const body = content.trim();
        const prefix = config.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        const ownerStatus = isOwner(sender);

        // --- 1. SYSTÈME DE RÉACTION ---
        if (config.autoReact && !msg.key.fromMe) {
            if (ownerStatus) {
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } else {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🇧🇫'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        // --- 2. SÉCURITÉ & STATS ---
        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);
        
        if (isGroup && !ownerStatus && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // --- 3. EXÉCUTION DES COMMANDES ---
        if (isCmd && commandName) {
            // Recherche dans le cache global pour ne rien oublier
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) return;

            // Log pro dans la console
            console.log(`📩 [ɢʜᴏꜱᴛɢ-x] Commande : ${commandName} | Par : ${pushName}`);

            // Mode Privé/Public
            if (config.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            // Check des Permissions
            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup) return reply("🚩 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢʀᴏᴜᴘᴇs.*");
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            // Fonction reply avec Signature Prestige
            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*` 
                }, { quoted: msg });
            };

            // Exécution
            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName,
                reply,
                react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
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
            await sock.sendMessage(from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*" });
        }
    });
};

module.exports = { 
    handleMessage, 
    handleGroupUpdate, 
    isOwner, 
    initializeAntiCall 
};
