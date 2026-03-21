/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database');
const { loadCommands } = require('./utils/commandLoader');
const { addMessage } = require('./utils/groupstats');
const { jidDecode, jidEncode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Cache & Commandes
const groupMetadataCache = new Map();
const commands = loadCommands();

/**
 * Normalisation des JIDs (Gestion LID/PN pour WhatsApp moderne)
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0];
};

const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    return config.ownerNumber.some(owner => owner.replace(/\D/g, '') === senderNumber);
};

const isAdmin = async (sock, participant, groupId, groupMetadata = null) => {
    if (!groupId.endsWith('@g.us')) return false;
    const metadata = groupMetadata || await sock.groupMetadata(groupId);
    const p = metadata.participants.find(v => v.id.split('@')[0] === participant.split('@')[0]);
    return p?.admin === 'admin' || p?.admin === 'superadmin';
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
        
        // Extraction du texte
        const content = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || 
                        msg.message.videoMessage?.caption || "";
        
        const body = content.trim();
        const isCmd = body.startsWith(config.prefix);
        const commandName = isCmd ? body.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        // 1. AUTO-REACT (ᴀɢᴍ Style)
        if (config.autoReact && !msg.key.fromMe) {
            const emojis = ['⚡', '💀', '🔥', '✨', '👑'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
        }

        // 2. STATISTIQUES
        if (isGroup) addMessage(from, sender);

        // 3. SÉCURITÉ ANTI-LIEN
        if (isGroup && !isOwner(sender) && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings(from);
            if (groupSettings.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // 4. EXÉCUTION DES COMMANDES
        if (isCmd) {
            const command = commands.get(commandName);
            if (!command) return;

            // Permissions
            const ownerStatus = isOwner(sender);
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return sock.sendMessage(from, { text: config.messages.ownerOnly });
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: config.messages.groupOnly });
            if (command.adminOnly && !adminStatus && !ownerStatus) return sock.sendMessage(from, { text: config.messages.adminOnly });

            // Presence (Typing...)
            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            console.log(`[EXEC] ${commandName} by ${sender}`);
            
            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus,
                reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
                react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
        }

    } catch (err) {
        console.error('❌ [HANDLER ERROR]:', err);
    }
};

/**
 * BIENVENUE & AU REVOIR (ᴀɢᴍ Visuals)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    const settings = database.getGroupSettings(id);

    for (const user of participants) {
        const userTag = `@${user.split('@')[0]}`;
        
        if (action === 'add' && settings.welcome) {
            const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: ${userTag} 👋\n┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏꜱᴛɢ-x\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
        } else if (action === 'remove' && settings.goodbye) {
            const byeText = `👋 Goodbye ${userTag}, on se voit plus tard ! 💀`;
            await sock.sendMessage(id, { text: byeText, mentions: [user] });
        }
    }
};
// Fonction pour bloquer les appels automatiquement
const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        const { id, from, status } = node[0];
        if (status === 'offer') {
            await sock.rejectCall(id, from);
            await sock.sendMessage(from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ. ᴠᴏᴜꜱ ᴀᴠᴇᴢ ᴇ́ᴛᴇ́ ʙʟᴏQᴜᴇ́.*" });
            await sock.updateBlockStatus(from, "block");
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner };
