/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (Prestige Edition V5.2 - Full Fusion)
 * Optimized & Fixed - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');

// --- SYSTÈME ANTI-RÉPÉTITION & COOLDOWN ---
const processedMessages = new Set();
const reactionCooldown = new Map();

setInterval(() => processedMessages.clear(), 10 * 60 * 1000);

/**
 * INITIALISATION DES COMMANDES (GLOBAL)
 */
global.commands = loadCommands();

/**
 * UTILITAIRES DE VÉRIFICATION
 */
const canReact = (jid) => {
    const now = Date.now();
    const last = reactionCooldown.get(jid) || 0;
    if (now - last < 3000) return false;
    reactionCooldown.set(jid, now);
    return true;
};

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
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

        // --- 🛡️ PROTECTION ANTI-DUPLICATION ---
        const messageTimestamp = msg.messageTimestamp; 
        const now = Math.floor(Date.now() / 1000);
        if (now - messageTimestamp > 15) return; 

        if (processedMessages.has(msg.key.id)) return;
        processedMessages.add(msg.key.id);

        // --- VARIABLES DE BASE ---
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? (msg.key.participant || msg.key.remoteJid) : from;
        const pushName = msg.pushName || 'ᴜsᴇʀ';
        const config = global.config;
        const prefix = config.prefix || '.';

        const getText = (m) => {
            return m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption ||
                   m?.videoMessage?.caption || m?.buttonsResponseMessage?.selectedButtonId ||
                   m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   m?.templateButtonReplyMessage?.selectedId || "";
        };

        const body = getText(msg.message).trim();
        if (!body) return;

        const ownerStatus = global.isOwner(sender);
        const isSupreme = global.isSupreme(sender);

        // --- SÉCURITÉ SELF-MODE ---
        if (config.selfMode && !ownerStatus && !msg.key.fromMe) return;

        // --- SYSTÈME TIC-TAC-TOE ---
        const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
        const tttResult = await handleTicTacToeMove(sock, msg, { sender, from, body });
        if (tttResult) return; 

        // --- DÉTECTION PRÉFIXE ET COMMANDE ---
        let activePrefix = prefix;
        if (isSupreme && body.startsWith('>')) activePrefix = '>';

        const isCmd = body.startsWith(activePrefix);
        const commandName = isCmd ? body.slice(activePrefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : body.trim().split(/\s+/);

        const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

        // --- 🎭 SYSTÈME DE RÉACTIONS AUTOMATIQUES (OPTIMISÉ) ---
        if (config.autoReact && canReact(from)) {
            // 1. Si c'est une commande (même lancée par toi)
            if (isCmd) {
                await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
            } 
            // 2. Si c'est un message du Maître/Owner (React Spécial)
            else if (ownerStatus) {
                await sock.sendMessage(from, { react: { text: config.supremeReact || '👑', key: msg.key } });
            }
            // 3. Si c'est un utilisateur lambda (Réaction Aléatoire) et PAS moi
            else if (!msg.key.fromMe) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '😉', '😍', '✝️', '😏', '😎', '🫂', '👋🏾', '❓', '💩', '😊'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } });
            }
        }

        // --- GHOSTG INTEL SYSTEM ---
        global.ghostgMode = global.ghostgMode || 'off'; 
        if (global.ghostgMode !== 'off' && ownerStatus && !isCmd) {
            const ghostgCmd = global.commands.get('ghostg');
            if (ghostgCmd) {
                const extra = {
                    from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, prefix, pushName,
                    reply: (text) => sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg }),
                    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
                    groupMetadata: isGroup ? await sock.groupMetadata(from) : null
                };
                return ghostgCmd.execute(sock, msg, args, extra);
            }
        }

        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // --- EXÉCUTION DES COMMANDES ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName) || [...global.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            if (!command) return;

            const reply = (text) => {
                return sock.sendMessage(from, { text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` }, { quoted: msg });
            };

            if (command.ownerOnly && !ownerStatus) return reply(config.messages.ownerOnly);
            if (command.groupOnly && !isGroup) return reply(config.messages.groupOnly);
            if (command.adminOnly && !adminStatus && !ownerStatus) return reply(config.messages.adminOnly);

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            try {
                await command.execute(sock, msg, args, {
                    from, sender, isGroup, isOwner: ownerStatus, isSupreme, isAdmin: adminStatus, prefix, pushName,
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
 * GESTIONNAIRE DE GROUPES
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings(id) || { welcome: true, goodbye: true };
        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || toSmallCaps("aucune description.");
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            if (action === 'add' && settings.welcome) {
                let welcomeText = settings.welcomeMessage || global.config.defaultGroupSettings.welcomeMessage;
                welcomeText = welcomeText.replace(/@user/g, userTag)
                                         .replace(/#groupName/g, groupName)
                                         .replace(/#groupDesc/g, groupDesc)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);
                await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
            }

            if (action === 'remove' && settings.goodbye) {
                let goodbyeText = settings.goodbyeMessage || global.config.defaultGroupSettings.goodbyeMessage;
                goodbyeText = goodbyeText.replace(/@user/g, userTag)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);
                await sock.sendMessage(id, { text: goodbyeText, mentions: [user] });
            }
        }
    } catch (e) { console.error('Group Update Error:', e); }
};

module.exports = { handleMessage, handleGroupUpdate };
