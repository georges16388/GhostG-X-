/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
// Note: Assure-toi que ces fichiers existent, sinon commente les lignes database/groupstats
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Cache & Commandes
const commands = loadCommands();

/**
 * Normalisation des JIDs
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0];
};

/**
 * Vérification Propriétaire (CORRIGÉE)
 */
const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const ownerList = config.OWNER_NUMBER || config.ownerNumber || [];
    const supreme = config.supremeNumber;

    // 1. Vérification Maître Suprême
    if (senderNumber === String(supreme).replace(/\D/g, '')) return true;

    // 2. Vérification liste des Owners
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

        // Extraction du texte multi-support
        const content = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || 
                        msg.message.videoMessage?.caption || "";

        const body = content.trim();
        const prefix = config.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        // 1. AUTO-REACT (ᴀɢᴍ Style)
        if (config.autoReact && !msg.key.fromMe) {
            const emojis = ['⚡', '💀', '🔥', '✨', '👑', '❤️', '😉', '😏', '🙏🏾'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
        }

        // 2. STATISTIQUES
        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // 3. SÉCURITÉ ANTI-LIEN
        if (isGroup && !isOwner(sender) && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // 4. EXÉCUTION DES COMMANDES
        if (isCmd && commandName) {
            const command = commands.get(commandName) || [...commands.values()].find(c => c.aliases && c.aliases.includes(commandName));
            
            if (!command) return;

            const ownerStatus = isOwner(sender);
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            // Checks Permissions
            if (command.ownerOnly && !ownerStatus) return sock.sendMessage(from, { text: config.messages.ownerOnly });
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: config.messages.groupOnly });
            if (command.adminOnly && !adminStatus && !ownerStatus) return sock.sendMessage(from, { text: config.messages.adminOnly });

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix,
                reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
                react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                downloadQuotedMedia: async () => { /* Logique de téléchargement ici */ }
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
    const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

    for (const user of participants) {
        const userTag = `@${user.split('@')[0]}`;
        if (action === 'add' && settings.welcome) {
            const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: ${userTag} 👋\n┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏꜱᴛɢ-x\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
        }
    }
};

/**
 * ANTI-CALL SYSTEM
 */
const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        const { id, from, status } = node[0];
        if (status === 'offer') {
            await sock.rejectCall(id, from);
            await sock.sendMessage(from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.*" });
        }
    });
};

// EXPORTS (CORRIGÉS)
module.exports = { 
    handleMessage, 
    handleGroupUpdate, 
    isOwner, 
    initializeAntiCall 
};
