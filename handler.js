/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.2 - Full Fusion)
 * Optimized & Fixed by Gemini - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');

// --- SYSTÈME ANTI-RÉPÉTITION & COOLDOWN ---
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
 * INITIALISATION DES COMMANDES (GLOBAL)
 */
global.commands = loadCommands();

/**
 * UTILITAIRES DE VÉRIFICATION CORRIGÉS
 */
const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const supreme = "22651622652"; 
    
    // On fusionne les deux sources possibles pour être sûr
    const ownerList = [
        ...(Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]),
        ...(Array.isArray(config.OWNER_NUMBER) ? config.OWNER_NUMBER : [config.OWNER_NUMBER])
    ];

    if (senderNumber === supreme) return true;
    return ownerList.some(owner => owner && normalizeJid(String(owner)) === senderNumber);
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
 * GESTIONNAIRE DE MESSAGES PRINCIPAL
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

        // --- SYSTÈME DE RÉACTIONS AUTOMATIQUES ---
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

        // --- EXÉCUTION DES COMMANDES ---
        if (isCmd && commandName) {
            // Recherche de la commande (insensible à la casse grâce au Loader corrigé)
            const command = global.commands.get(commandName);

            if (!command) return;
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*` 
                }, { quoted: msg });
            };

            // Vérifications des permissions
            if (command.ownerOnly && !ownerStatus) return reply(`❌ *${toSmallCaps("cette commande est reservee a l'owner.")}*`);
            if (command.groupOnly && !isGroup) return reply(`❌ *${toSmallCaps("cette commande est reservee aux groupes.")}*`);
            if (command.adminOnly && !adminStatus && !ownerStatus) return reply(`❌ *${toSmallCaps("cette commande est reservee aux admins.")}*`);

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName,
                    reply,
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                });
            } catch (err) {
                console.error('Execute Error:', err);
                reply(`❌ *${toSmallCaps("erreur lors de l'execution de la commande.")}*`);
            }
        }
    } catch (err) { console.error('Handler Error:', err); }
};

/**
 * GESTIONNAIRE DE GROUPES (WELCOME & GOODBYE)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings(id) || { welcome: true, goodbye: true };
        const metadata = await sock.groupMetadata(id);
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

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

            if (action === 'remove' && settings.goodbye) {
                let goodbyeText = settings.goodbyeMessage || `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ* •≫━╾╮\n┃ *ᴀᴜ ʀᴇᴠᴏɪʀ* : @user 👋\n┃ *ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*\n┃ *ᴍᴇᴍʙʀᴇs* : #memberCount\n┃ *ᴛɪᴍᴇ* : #time ⏰\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                goodbyeText = goodbyeText.replace(/@user/g, userTag)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);

                await sock.sendMessage(id, { text: goodbyeText, mentions: [user] });
            }
        }
    } catch (e) { console.error('Group Update Error:', e); }
};

/**
 * SYSTÈME ANTI-APPEL (INITIALISATION)
 */
const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (calls) => {
        const { anticall } = require('./config'); 
        if (!anticall) return;

        for (const call of calls) {
            if (call.status === 'offer') {
                await sock.rejectCall(call.id, call.from);
                const warnMsg = `╭╼━≪• *ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ* •≫━╾╮\n┃\n┃ ⚠️ ${toSmallCaps("appels interdits")}\n┃ ${toSmallCaps("votre appel a ete rejete")}\n┃\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                await sock.sendMessage(call.from, { text: warnMsg });
            }
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
