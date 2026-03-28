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

    const ownerList = [
        ...(Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]),
        ...(Array.isArray(config.OWNER_NUMBER) ? config.OWNER_NUMBER : [config.OWNER_NUMBER])
    ].map(o => normalizeJid(String(o))).filter(Boolean);

    if (senderNumber === supreme) return true;
    return ownerList.includes(senderNumber);
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
        
        // Dans ton handler.js, juste avant la détection des commandes (isCmd)
const { handleTicTacToeMove } = require('./commands/fun/tictactoe');
const tttResult = await handleTicTacToeMove(sock, msg, { sender, from, body });
if (tttResult) return; // Si c'est un coup de Morpion, on s'arrête là

      if (global.ghostgMode !== 'off' && isOwner && !msg.body.startsWith(prefix)) {
    // Si GhostG est ON, il analyse tous les messages du propriétaire
    const ghostgCmd = global.commands.get('ghostg');
    return ghostgCmd.execute(sock, msg, msg.body.split(' '), extra);
}

        const body = getText(msg.message).trim();
        const isCmd = body.startsWith(prefix);
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];
        const ownerStatus = isOwner(sender);

        // --- RÉACTIONS AUTOMATIQUES ---
        if (config.autoReact && canReact(from) && !msg.key.fromMe) {
            if (ownerStatus) {
                const sReact = config.supremeReact || '👑';
                await sock.sendMessage(from, { react: { text: sReact, key: msg.key } });
            } else {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '🙏🏾', '🔗', '😉', '😍', '✝️', '😏', '😎', '🫂', '👋🏾', '❓', '💩', '😊'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        if (isGroup && typeof addMessage === 'function') addMessage(from, sender);

        // --- EXÉCUTION DES COMMANDES ---
        if (isCmd && commandName) {
            const command = global.commands.get(commandName);
            if (!command) return;
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            const reply = (text) => {
                return sock.sendMessage(from, { 
                    text: `${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` 
                }, { quoted: msg });
            };

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
 * GESTIONNAIRE DE GROUPES (WELCOME & GOODBYE ELITE)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    try {
        const settings = database.getGroupSettings(id) || { welcome: true, goodbye: true };
        const metadata = await sock.groupMetadata(id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || toSmallCaps("aucune description.");
        const time = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Ouagadougou' });

        // Image par défaut si la récupération échoue
        const defaultThumb = "https://files.catbox.moe/2fmwpu.jpg"; 

        for (const user of participants) {
            const userTag = `@${user.split('@')[0]}`;

            if (action === 'add' && settings.welcome) {
                // Design Welcome Prestige (Aéré & Gras Premium)
                let welcomeText = settings.welcomeMessage || 
`*╭╼━≪• ✨ ɴᴇᴡ ᴍᴇᴍʙᴇʀ ✨ •≫━╾╮*
*┃*
*┃* 👥 *ɢʀᴏᴜᴘ* : *#groupName*
*┃* 👋🏾 *ᴡᴇʟᴄᴏᴍᴇ* : *@user*
*┃*
*┃* 📝 *#groupDesc*
*┃*
*┃* 📊 *ᴍᴇᴍʙʀᴇs* : *#memberCount*
*┃* ⏰ *ᴛɪᴍᴇ* : *#time*
*┃*
*┃* 🛡️ *${toSmallCaps("respecte les regles pour")}*
*┃* *${toSmallCaps("ne pas etre retire...")}*
*┃*
*┃* ❤️ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                welcomeText = welcomeText.replace(/@user/g, userTag)
                                         .replace(/#groupName/g, groupName)
                                         .replace(/#groupDesc/g, groupDesc)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);

                // Récupération de l'image de profil du membre
                let ppUrl = defaultThumb;
                try {
                    ppUrl = await sock.profilePictureUrl(user, 'image');
                } catch { /* Conserver defaultThumb */ }

                await sock.sendMessage(id, { 
                    text: welcomeText, 
                    mentions: [user], 
                    contextInfo: {
                        externalAdReply: { 
                            title: "ɢʜᴏꜱᴛɢ-x ᴘʀᴇꜱᴛɪɢᴇ", 
                            body: `ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ${groupName}`, 
                            mediaType: 1, 
                            thumbnailUrl: ppUrl, // Affiche l'image du membre
                        }
                    }
                });
            }

            if (action === 'remove' && settings.goodbye) {
                // Design Goodbye Elite (Aéré & Gras Premium)
                let goodbyeText = settings.goodbyeMessage || 
`*╭╼━≪• 🥀 ɢᴏᴏᴅʙʏᴇ ᴍᴇᴍʙᴇʀ •≫━╾╮*
*┃*
*┃* 👋🏾 *ᴀᴜ ʀᴇᴠᴏɪʀ* : *@user*
*┃*
*┃* 🚪 *${toSmallCaps("malheureusement tu n'as")}*
*┃* *${toSmallCaps("pas respecte les regles...")}* 🙂‍↔️
*┃*
*┃* 📊 *ᴍᴇᴍʙʀᴇs* : *#memberCount*
*┃* ⏰ *ᴛɪᴍᴇ* : *#time*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                goodbyeText = goodbyeText.replace(/@user/g, userTag)
                                         .replace(/#memberCount/g, metadata.participants.length)
                                         .replace(/#time/g, time);

                // Pour le goodbye, on n'affiche pas l'image du membre (car il est parti)
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
        const configLive = require('./config'); 
        if (!configLive.anticall) return;

        for (const call of calls) {
            if (call.status === 'offer') {
                await sock.rejectCall(call.id, call.from);
                const warnMsg = `*╭╼━≪• ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ •≫━╾╮*\n*┃*\n*┃* ⚠️ *${toSmallCaps("appels interdits")}*\n*┃* *${toSmallCaps("votre appel a ete rejete")}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                await sock.sendMessage(call.from, { text: warnMsg });
            }
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
