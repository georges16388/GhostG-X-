/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const fs = require('fs');
const path = require('path');

// Cache & Commandes
const commands = loadCommands();

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
    const ownerList = config.OWNER_NUMBER || config.ownerNumber || [];
    const supreme = String(config.supremeNumber || "").replace(/\D/g, '');

    if (senderNumber === supreme) return true;

    if (Array.isArray(ownerList)) {
        return ownerList.some(owner => String(owner).replace(/\D/g, '') === senderNumber);
    } else {
        return String(ownerList).replace(/\D/g, '') === senderNumber;
    }
};

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
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';

        // Extraction du texte
        const m = msg.message;
        const content = m.conversation || 
                        m.extendedTextMessage?.text || 
                        m.imageMessage?.caption || 
                        m.videoMessage?.caption || "";

        const body = content.trim();
        const prefix = config.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        const ownerStatus = isOwner(sender);

        // --- 1. SUPREME REACT (Nouveau) ---
        // Le bot réagit avec une couronne si c'est le Maître Suprême qui parle
        if (ownerStatus && config.autoReact) {
            await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
        } 
        // Auto-React normal pour les autres
        else if (config.autoReact && !msg.key.fromMe) {
            const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🇧🇫'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
        }

        // 2. STATISTIQUES
        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // 3. SÉCURITÉ ANTI-LIEN
        if (isGroup && !ownerStatus && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // 4. EXÉCUTION DES COMMANDES
        if (isCmd && commandName) {
            const command = commands.get(commandName) || [...commands.values()].find(c => c.aliases && c.aliases.includes(commandName));
            
            if (!command) return;

            // Logs de commande
            console.log(`📩 [ɢʜᴏꜱᴛɢ-x] Commande : ${commandName} | Par : ${pushName}`);

            if (config.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: "🚩 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢʀᴏᴜᴘᴇs.*" });
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            // Fonction reply avec Signature GhostG X
            const reply = (text) => {
                const signedText = `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                return sock.sendMessage(from, { text: signedText }, { quoted: msg });
            };

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
 * BIENVENUE & AU REVOIR
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

        for (const user of participants) {
            if (action === 'add' && settings.welcome) {
                const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: @${user.split('@')[0]} 👋🏾\n┃ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️✝️\n╰━━━━━━━━━━━━━━━╯\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
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
