/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.1 - Fusion)
 * Optimized by Gemini - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');

// --- sʏsᴛᴇ̀ᴍᴇ ᴀɴᴛɪ-ʀᴇ́ᴘᴇ́ᴛɪᴛɪᴏɴ & ᴄᴏᴏʟᴅᴏᴡɴ ---
const processedMessages = new Set();
const reactionCooldown = new Map();

setInterval(() => processedMessages.clear(), 10 * 60 * 1000);

const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

/**
 * ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs
 */
global.commands = loadCommands();

/**
 * ᴜᴛɪʟɪᴛᴀɪʀᴇs ᴅᴇ ᴠᴇ́ʀɪꜰɪᴄᴀᴛɪᴏɴ
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const supreme = "22651622652"; 
    const ownerList = Array.isArray(config.OWNER_NUMBER) ? config.OWNER_NUMBER : [config.OWNER_NUMBER];
    if (senderNumber === supreme) return true;
    return ownerList.some(owner => String(owner).replace(/\D/g, '') === senderNumber);
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
 * ɢᴇsᴛɪᴏɴɴᴀɪʀᴇ ᴅᴇ ᴍᴇssᴀɢᴇs
 */
const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        if (processedMessages.has(msg.key.id)) return;
        processedMessages.add(msg.key.id);

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const prefix = config.prefix || '.';

        const getText = (m) => {
            return m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption ||
                   m?.videoMessage?.caption || m?.buttonsResponseMessage?.selectedButtonId ||
                   m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   m?.templateButtonReplyMessage?.selectedId || "";
        };

        const body = getText(msg.message).trim();
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];
        const ownerStatus = isOwner(sender);

        // --- sʏsᴛᴇ̀ᴍᴇ ᴅᴇ ʀᴇ́ᴀᴄᴛɪᴏɴs ---
        if (config.autoReact && canReact(from)) {
            if (ownerStatus) {
                const sReact = config.supremeReact || '👑';
                await sock.sendMessage(from, { react: { text: sReact, key: msg.key } });
            } else if (!msg.key.fromMe) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🇧🇫'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // --- ᴇxᴇ́ᴄᴜᴛɪᴏɴ ᴄᴏᴍᴍᴀɴᴅᴇs ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) return;
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*` 
                }, { quoted: msg });
            };

            if (command.ownerOnly && !ownerStatus) return reply(config.messages.ownerOnly);
            if (command.groupOnly && !isGroup) return reply(config.messages.groupOnly);
            if (command.adminOnly && !adminStatus && !ownerStatus) return reply(config.messages.adminOnly);

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                });
            } catch (err) {
                console.error(err);
                reply(config.messages.error);
            }
        }
    } catch (err) { console.error('Handler Error:', err); }
};

/**
 * ɢᴇsᴛɪᴏɴɴᴀɪʀᴇ ᴅᴇ ɢʀᴏᴜᴘᴇs (ᴡᴇʟᴄᴏᴍᴇ & ɢᴏᴏᴅʙʏᴇ ᴅʏɴᴀᴍɪǫᴜᴇ)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings(id) || { welcome: true, goodbye: true };
        const metadata = await sock.groupMetadata(id);
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            // --- Section Welcome ---
            if (action === 'add' && settings.welcome) {
                let welcomeText = settings.welcomeMessage || `╭╼━≪• *ɴᴇᴡ ᴍᴇᴍʙᴇʀ* •≫━╾╮\n┃ *ᴡᴇʟᴄᴏᴍᴇ* : @user 👋🏾\n┃ *ɴᴏᴜs sᴏᴍᴍᴇs ʜᴇᴜʀᴇᴜx\n┃ ᴅᴇ ᴛ'ᴀᴠᴏɪʀ ᴘᴀʀᴍɪ ɴᴏᴜs*\n┃ *ᴍᴇᴍʙʀᴇs* : #memberCount\n┃ *ᴛɪᴍᴇ* : #time ⏰\n┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️*\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                
                welcomeText = welcomeText.replace(/@user/g, userTag)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);

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

            // --- Section Goodbye ---
            if (action === 'remove' && settings.goodbye) {
                let goodbyeText = settings.goodbyeMessage || `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ* •≫━╾╮\n┃ *ᴀᴜ ʀᴇᴠᴏɪʀ* : @user 👋\n┃ *ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*\n┃ *ᴍᴇᴍʙʀᴇs* : #memberCount\n┃ *ᴛɪᴍᴇ* : #time ⏰\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                
                goodbyeText = goodbyeText.replace(/@user/g, userTag)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);

                await sock.sendMessage(id, { text: goodbyeText, mentions: [user] });
            }
        }
    } catch (e) { console.error('Group Update Error:', e); }
};

/**
 * sʏsᴛᴇ̀ᴍᴇ ᴀɴᴛɪ-ᴀᴘᴘᴇʟ
 */
const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (calls) => {
        for (const call of calls) {
            if (call.status === 'offer') {
                await sock.rejectCall(call.id, call.from);
                await sock.sendMessage(call.from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*" });
            }
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
