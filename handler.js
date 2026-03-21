/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler (ULTRA-FAST EDITION)
 * Optimized for ~100ms Response Time
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const autoReactUtil = require('./utils/autoReact'); 
const fs = require('fs');
const path = require('path');

let commands = loadCommands();

const normalizeJid = (jid) => {
    if (!jid) return null;
    return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
};

const isOwner = (sender) => {
    const senderNumber = normalizeJid(sender);
    const ownerList = config.OWNER_NUMBER || config.ownerNumber || [];
    const supreme = config.supremeNumber;
    if (senderNumber === String(supreme).replace(/\D/g, '')) return true;
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

        const content = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || 
                        msg.message.videoMessage?.caption || "";

        const body = content.trim();
        const prefix = config.prefix || '.';

        const isCmd = body.startsWith(prefix);
        const args = isCmd ? body.slice(prefix.length).trim().split(/\s+/) : [];
        const commandName = isCmd ? args.shift().toLowerCase() : null;

        const ownerStatus = isOwner(sender);

        // --- 1. LOGIQUE TIC-TAC-TOE (INSTANTANÉE) ---
        if (global.games) {
            const room = Object.values(global.games).find(r => 
                r.state === 'PLAYING' && [r.playerX, r.playerO].includes(sender)
            );
            if (room && /^[1-9]$/.test(body)) {
                const tttCmd = commands.get('tictactoe');
                if (tttCmd) return await tttCmd.execute(sock, msg, [body], { from, sender, prefix, isGroup });
            }
        }

        // --- 2. AUTO-REACT (SUPPRESSION DES DÉLAIS) ---
        delete require.cache[require.resolve('./config')];
        const currentCfg = require('./config');

        if (currentCfg.autoReact && !msg.key.fromMe) {
            if (ownerStatus) {
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } else if (currentCfg.autoReactMode === 'all' || (currentCfg.autoReactMode === 'bot' && isCmd)) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '😉', '😏', '🙏🏾', '🤌🏾', '👌🏾', '🇧🇫', '🤣', '😊', '🫂', '💪🏾', '👍🏾', '💩'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }

        // --- 3. EXÉCUTION COMMANDES (MODE FLASH) ---
        if (isCmd && commandName) {
            const command = commands.get(commandName) || [...commands.values()].find(c => c.aliases?.includes(commandName));
            if (!command) return;

            if (currentCfg.selfMode && !ownerStatus) return;

            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return sock.sendMessage(from, { text: config.messages.ownerOnly });
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: config.messages.groupOnly });
            if (command.adminOnly && !adminStatus && !ownerStatus) return sock.sendMessage(from, { text: config.messages.adminOnly });

            // --- VITESSE MAXIMUM : PAS DE SIMULATION D'ÉCRITURE ---
            await sock.readMessages([msg.key]);

            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName: msg.pushName || 'User',
                reply: async (text) => {
                    // Suppression du délai de 300ms
                    return sock.sendMessage(from, { text }, { quoted: msg });
                },
                react: async (emoji) => {
                    // Suppression du délai de 200ms
                    return sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
                }
            });
        }

    } catch (err) {
        console.error('❌ [ULTRA-FAST HANDLER ERROR]:', err);
    }
};

/**
 * GESTION DES GROUPES & ANTI-CALL (RAPIDE)
 */
const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

    for (const user of participants) {
        if (action === 'add' && settings.welcome) {
            const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: @${user.split('@')[0]} 👋🏾\n┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏꜱᴛɢ-x\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
        }
    }
};

const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        if (node[0].status === 'offer') {
            await sock.rejectCall(node[0].id, node[0].from);
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
