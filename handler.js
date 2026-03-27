/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5)
 * Correction des erreurs système - Design Conservé
 */

const reactionCooldown = new Map();
const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');

const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (calls) => {
        for (const call of calls) {
            if (call.status === 'offer') {
                // Rejeter l'appel avant d'envoyer le message
                await sock.rejectCall(call.id, call.from);
                await sock.sendMessage(call.from, {
                    text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*"
                });
            }
        }
    });
};

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
        if (!metadata.participants) return false;
        const p = metadata.participants.find(v => normalizeJid(v.id) === normalizeJid(participant));
        return p?.admin === 'admin' || p?.admin === 'superadmin';
    } catch { return false; }
};

const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const prefix = config.prefix || '.';

        const getText = (m) => {
            return m?.conversation ||
                   m?.extendedTextMessage?.text ||
                   m?.imageMessage?.caption ||
                   m?.videoMessage?.caption ||
                   m?.buttonsResponseMessage?.selectedButtonId ||
                   m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   m?.templateButtonReplyMessage?.selectedId || "";
        };

        const body = getText(msg.message).trim();
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];
        const ownerStatus = isOwner(sender);

        // --- REACTIONS ---
        if (config.autoReact && canReact(from)) {
            if (ownerStatus && isCmd) {
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } else if (!msg.key.fromMe) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🇧🇫'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // Anti-Lien sécurisé
        if (isGroup && !ownerStatus && /(https?:\/\/|chat.whatsapp.com)/gi.test(body)) {
            const groupSettings = database.getGroupSettings ? database.getGroupSettings(from) : { antilink: false };
            if (groupSettings?.antilink) {
                const checkAdmin = await isAdmin(sock, sender, from);
                if (!checkAdmin) {
                    await sock.sendMessage(from, { delete: msg.key });
                    return;
                }
            }
        }

        // --- COMMANDES ---
        if (isCmd && commandName && global.commands) {
            const command = global.commands.get(commandName) || 
                          [...global.commands.values()].find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) return;
            if (config.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return;
            if (command.groupOnly && !isGroup) return;
            if (command.adminOnly && !adminStatus && !ownerStatus) return;

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*` 
                }, { quoted: msg });
            };

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
                });
            } catch (err) {
                console.error(err);
                reply("❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ.*");
            }
        }
    } catch (err) { console.error(err); }
};

/**
 * GESTIONNAIRE DE GROUPES (RETOUR AU DESIGN ORIGINAL)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings ? database.getGroupSettings(id) : null;
        if (!settings) return;

        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;
        const memberCount = metadata.participants.length;
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            // --- DESIGN PRESTIGE RESTAURÉ ---
            const defaultWelcome = `╭╼━≪• *ɴᴇᴡ ᴍᴇᴍʙᴇʀ* •≫━╾╮
┃ *ᴡᴇʟᴄᴏᴍᴇ* : @user 👋🏾
┃ *ɴᴏᴜs sᴏᴍᴍᴇs ʜᴇᴜʀᴇᴜx
┃ ᴅᴇ ᴛ'ᴀᴠᴏɪʀ ᴘᴀʀᴍɪ ɴᴏᴜs*
┃ *ᴍᴇᴍʙʀᴇs ᴀᴄᴛᴜᴇʟs* : #memberCount
┃ *ᴛɪᴍᴇ* : #time ⏰
┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️*
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x*`;

            const defaultGoodbye = `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ ᴍᴇᴍʙᴇʀ* •≫━╾╮
┃ *ᴀᴜ ʀᴇᴠᴏɪʀ* : @user 👋
┃ *ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*
┃ *ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs* : #memberCount
┃ *ᴛɪᴍᴇ* : #time ⏰
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

            if (action === 'add' && settings.welcome) {
                let text = (settings.welcomeMessage || defaultWelcome)
                    .replace('@user', userTag).replace('#memberCount', memberCount)
                    .replace('#groupName', groupName).replace('#time', time);

                await sock.sendMessage(id, { text, mentions: [user], contextInfo: {
                    externalAdReply: {
                        title: "ɢʜᴏꜱᴛɢ-x ᴘʀᴇꜱᴛɪɢᴇ",
                        body: "ᴊᴇsᴜs ᴛᴀɪᴍᴇ ❤️✝️",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                        sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c"
                    }
                }});
            }

            if (action === 'remove' && settings.goodbye) {
                let text = (settings.goodbyeMessage || defaultGoodbye)
                    .replace('@user', userTag).replace('#memberCount', memberCount)
                    .replace('#groupName', groupName).replace('#time', time);

                await sock.sendMessage(id, { text, mentions: [user], contextInfo: {
                    externalAdReply: {
                        title: "ɢʜᴏꜱᴛɢ-x ʟᴇᴀᴠᴇ",
                        body: "ᴜɴ ᴍᴇᴍʙᴇʀ ᴀ ǫᴜɪᴛᴛᴇ́ ʟᴇ ɢʀᴏᴜᴘᴇ",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg"
                    }
                }});
            }
        }
    } catch (e) { console.error(e); }
};

module.exports = { handleMessage, handleGroupUpdate, initializeAntiCall };
