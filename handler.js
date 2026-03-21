/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴍᴇssᴀɢᴇ ʜᴀɴᴅʟᴇʀ (ᴜʟᴛʀᴀ-ꜰᴀsᴛ ᴇᴅɪᴛɪᴏɴ)
 * ᴏᴘᴛɪᴍɪᴢᴇᴅ ꜰᴏʀ ~100ᴍs ʀᴇsᴘᴏɴsᴇ ᴛɪᴍᴇ
 * ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const fs = require('fs');
const path = require('path');

// --- ɪɴɪᴛɪᴀʟɪsᴀᴛɪᴏɴ ɢʟᴏʙᴀʟᴇ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs ---
global.commands = global.commands || loadCommands();

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const ownerList = config.OWNER_NUMBER || config.ownerNumber || [];
    const supreme = String(config.supremeNumber || "").replace(/\D/g, '');
    
    if (senderNumber === supreme) return true;
    if (Array.isArray(ownerList)) {
        return ownerList.some(owner => String(owner).replace(/\D/g, '') === senderNumber);
    }
    return String(ownerList).replace(/\D/g, '') === senderNumber;
};

const isAdmin = async (sock, participant, groupId) => {
    if (!groupId.endsWith('@g.us')) return false;
    try {
        const metadata = await sock.groupMetadata(groupId);
        const p = metadata.participants.find(v => v.id.split('@')[0] === participant.split('@')[0]);
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;

        // --- ɪɴᴄʀᴇ́ᴍᴇɴᴛᴀᴛɪᴏɴ ᴅᴇs sᴛᴀᴛs (ʀᴇᴍɪs) ---
        if (isGroup && addMessage) await addMessage(from, sender);

        // --- ᴅᴇ́ᴛᴇᴄᴛɪᴏɴ ᴅᴜ ᴄᴏɴᴛᴇɴᴜ ᴇ́ʟᴀʀɢɪᴇ ---
        const m = msg.message;
        const content = m.conversation || 
                        m.extendedTextMessage?.text || 
                        m.imageMessage?.caption || 
                        m.videoMessage?.caption || 
                        m.documentWithCaptionMessage?.message?.documentMessage?.caption ||
                        m.buttonsResponseMessage?.selectedButtonId ||
                        m.listResponseMessage?.singleSelectReply?.selectedRowId || "";

        const body = content.trim();
        const prefix = config.prefix || '.';

        const isCmd = body.startsWith(prefix);
        const args = isCmd ? body.slice(prefix.length).trim().split(/\s+/) : [];
        const commandName = isCmd ? args.shift().toLowerCase() : null;

        const ownerStatus = isOwner(sender);

        // --- 1. ʟᴏɢɪǫᴜᴇ ᴛɪᴄ-ᴛᴀᴄ-ᴛᴏᴇ ---
        if (global.games) {
            const room = Object.values(global.games).find(r => 
                r.state === 'PLAYING' && [r.playerX, r.playerO].includes(sender)
            );
            if (room && /^[1-9]$/.test(body)) {
                const tttCmd = global.commands.get('tictactoe');
                if (tttCmd) return await tttCmd.execute(sock, msg, [body], { from, sender, prefix, isGroup });
            }
        }

        // --- 2. ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ (ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴅʏɴᴀᴍɪǫᴜᴇ) ---
        delete require.cache[require.resolve('./config')];
        const currentCfg = require('./config');

        if (currentCfg.autoReact && !msg.key.fromMe) {
            if (ownerStatus) {
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } else if (currentCfg.autoReactMode === 'all' || (currentCfg.autoReactMode === 'bot' && isCmd)) {
                const emojis = ['⚡', '💀', '🔥', '✨', '🙏🏾', '👌🏾', '🇧🇫', '💪🏾', '❤️', '🤣', '🫰🏾',];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        // --- 3. ᴇxᴇ́ᴄᴜᴛɪᴏɴ ᴄᴏᴍᴍᴀɴᴅᴇs ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) return;
            if (currentCfg.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return; 
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: '🚩 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢʀᴏᴜᴘᴇs.*' });
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            await sock.readMessages([msg.key]);

            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, 
                pushName: msg.pushName || 'ᴜsᴇʀ',
                reply: async (text) => sock.sendMessage(from, { text: `${text}` }, { quoted: msg }),
                react: async (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
        }

    } catch (err) {
        console.error('❌ [ᴜʟᴛʀᴀ-ꜰᴀsᴛ ʜᴀɴᴅʟᴇʀ ᴇʀʀᴏʀ]:', err);
    }
};

/**
 * ɢᴇsᴛɪᴏɴ ᴅᴇs ɢʀᴏᴜᴘᴇs & ᴡᴇʟᴄᴏᴍᴇ (ʀᴇᴍɪs & ᴄᴏʀʀɪɢᴇ́)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        // Vérification des paramètres du groupe via ta DB
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

const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        if (node[0].status === 'offer') {
            await sock.rejectCall(node[0].id, node[0].from);
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
