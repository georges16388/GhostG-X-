/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴍᴇssᴀɢᴇ ʜᴀɴᴅʟᴇʀ (ᴘʀᴇsᴛɪɢᴇ ᴇᴅɪᴛɪᴏɴ)
 * ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */
console.log(`📩 [DEBUG] Message de ${sender} : ${body} | Commande détectée : ${isCmd}`);

// Ne pas utiliser "const commands = loadCommands()" tout seul
global.commands = global.commands || loadCommands();
// Ensuite, dans l'exécution :
const command = global.commands.get(commandName) || 
              [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ ɢʟᴏʙᴀʟᴇ (ᴄʀɪᴛɪǫᴜᴇ ᴘᴏᴜʀ ᴛᴇs 105 ᴄᴍᴅs) ---
global.commands = global.commands || loadCommands();

/**
 * ɴᴏʀᴍᴀʟɪsᴀᴛɪᴏɴ ᴅᴇs ᴊɪᴅs
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

/**
 * ᴠᴇ́ʀɪꜰɪᴄᴀᴛɪᴏɴ ᴘʀᴏᴘʀɪᴇ́ᴛᴀɪʀᴇ
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
 * ɢᴇsᴛɪᴏɴɴᴀɪʀᴇ ᴘʀɪɴᴄɪᴘᴀʟ
 */
const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;

        // ᴇxᴛʀᴀᴄᴛɪᴏɴ ᴅᴜ ᴛᴇxᴛᴇ ᴍᴜʟᴛɪ-sᴜᴘᴘᴏʀᴛ
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

        // 1. ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ (ᴀɢᴍ sᴛʏʟᴇ)
        if (config.autoReact && !msg.key.fromMe) {
            const emojis = ['⚡', '💀', '🔥', '✨', '👑', '❤️', '🙏🏾', '🇧🇫'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
        }

        // 2. sᴛᴀᴛɪsᴛɪǫᴜᴇs (ʀᴇᴍɪs ᴇɴ ᴘʟᴀᴄᴇ)
        if (isGroup && typeof addMessage === 'function') await addMessage(from, sender);

        // 3. sᴇ́ᴄᴜʀɪᴛᴇ́ ᴀɴᴛɪ-ʟɪᴇɴ
        if (isGroup && !isOwner(sender) && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink && !(await isAdmin(sock, sender, from))) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }
        }

        // 4. ᴇxᴇ́ᴄᴜᴛɪᴏɴ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs
        if (isCmd && commandName) {
            // ᴄᴏʀʀᴇᴄᴛɪᴏɴ : ᴜᴛɪʟɪsᴀᴛɪᴏɴ ᴅᴇ ɢʟᴏʙᴀʟ.ᴄᴏᴍᴍᴀɴᴅᴇs
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));
            
            if (!command) return;

            const ownerStatus = isOwner(sender);
            
            // sᴇ́ᴄᴜʀɪᴛᴇ́ ᴍᴏᴅᴇ sᴇʟꜰ/ᴘʀɪᴠᴇ́
            if (config.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            // ᴄʜᴇᴄᴋs ᴘᴇʀᴍɪssɪᴏɴs
            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: "🚩 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢʀᴏᴜᴘᴇs.*" });
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix,
                pushName: msg.pushName || 'ᴜsᴇʀ',
                reply: (text) => sock.sendMessage(from, { text: `${text}` }, { quoted: msg }),
                react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
        }

    } catch (err) {
        console.error('❌ [ʜᴀɴᴅʟᴇʀ ᴇʀʀᴏʀ]:', err);
    }
};

/**
 * ʙɪᴇɴᴠᴇɴᴜᴇ & ᴀᴜ ʀᴇᴠᴏɪʀ
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

        for (const user of participants) {
            if (action === 'add' && settings.welcome) {
                const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: @${user.split('@')[0]} 👋🏾\n┃ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️✝️\n┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x\n╰━━━━━━━━━━━━━━━╯`;
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

/**
 * ᴀɴᴛɪ-ᴄᴀʟʟ sʏsᴛᴇᴍ
 */
const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        const { id, from, status } = node[0];
        if (status === 'offer') {
            await sock.rejectCall(id, from);
            await sock.sendMessage(from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.* \nᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️✝️" });
        }
    });
};

module.exports = { 
    handleMessage, 
    handleGroupUpdate, 
    isOwner, 
    initializeAntiCall 
};
