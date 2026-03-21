/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Main Message Handler
 */

const config = require('./config');
const database = require('./database'); 
const { addMessage } = require('./utils/groupstats');
const { loadCommands } = require('./utils/commandLoader');
const autoReactUtil = require('./utils/autoReact'); 
const fs = require('fs');
const path = require('path');

const commands = loadCommands();

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
        const commandName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : null;
        const args = isCmd ? body.trim().split(/\s+/).slice(1) : [];

        // --- 1. LOGIQUE TIC-TAC-TOE (RÉPONSE AUX CHIFFRES) ---
        if (global.games) {
            const room = Object.values(global.games).find(r => 
                r.state === 'PLAYING' && [r.playerX, r.playerO].includes(sender) && r.id.includes(from.split('@')[0])
            );
            if (room && /^[1-9]$/.test(body)) {
                // Le jeu s'occupe du reste via le moteur TicTacToe
                const tttCmd = commands.get('tictactoe');
                if (tttCmd) return await tttCmd.execute(sock, msg, [body], { from, sender, prefix, isGroup });
            }
        }

                // --- 2. AUTO-REACT DYNAMIQUE ---
        const currentCfg = require('./config');
        const arEnabled = currentCfg.autoReact;
        const arMode = currentCfg.autoReactMode || 'all';

        if (arEnabled && !msg.key.fromMe) {
            const ownerStatus = isOwner(sender); // On vérifie si c'est toi

            // LOGIQUE SPÉCIALE CHEF SUPRÊME
            if (ownerStatus) {
                // Si c'est le chef, on met TOUJOURS la couronne
                await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
            } 
            // LOGIQUE NORMALE POUR LES AUTRES
            else if (arMode === 'all' || (arMode === 'bot' && isCmd)) {
                const emojis = ['⚡', '💀', '🔥', '✨', '❤️', '😉', '😏', '🙏🏾'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: isCmd ? '⏳' : randomEmoji, key: msg.key } });
            }
        }


        // --- 3. EXÉCUTION COMMANDES ---
        if (isCmd && commandName) {
            const command = commands.get(commandName) || [...commands.values()].find(c => c.aliases?.includes(commandName));
            if (!command) return;

            const ownerStatus = isOwner(sender);
            const adminStatus = isGroup ? await isAdmin(sock, sender, from) : false;

            if (command.ownerOnly && !ownerStatus) return sock.sendMessage(from, { text: config.messages.ownerOnly });
            if (command.groupOnly && !isGroup) return sock.sendMessage(from, { text: config.messages.groupOnly });
            if (command.adminOnly && !adminStatus && !ownerStatus) return sock.sendMessage(from, { text: config.messages.adminOnly });

            if (config.autoTyping) await sock.sendPresenceUpdate('composing', from);

            await command.execute(sock, msg, args, {
                from, sender, isGroup, isOwner: ownerStatus, isAdmin: adminStatus, prefix, pushName: msg.pushName,
                reply: (text) => sock.sendMessage(from, { text }, { quoted: msg }),
                react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } })
            });
        }

    } catch (err) {
        console.error('❌ [HANDLER ERROR]:', err);
    }
};

const handleGroupUpdate = async (sock, update) => {
    const { id, participants, action } = update;
    const settings = database.getGroupSettings ? database.getGroupSettings(id) : { welcome: true };

    for (const user of participants) {
        if (action === 'add' && settings.welcome) {
            const welcomeText = `╭╼━≪• ɴᴇᴡ ᴍᴇᴍʙᴇʀ •≫━╾╮\n┃ ᴡᴇʟᴄᴏᴍᴇ: @${user.split('@')[0]} 👋\n┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏꜱᴛɢ-x\n╰━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(id, { text: welcomeText, mentions: [user] });
        }
    }
};

const initializeAntiCall = (sock) => {
    sock.ev.on('call', async (node) => {
        if (node[0].status === 'offer') {
            await sock.rejectCall(node[0].id, node[0].from);
            await sock.sendMessage(node[0].from, { text: "🚫 *ʟᴇꜱ ᴀᴘᴘᴇʟꜱ ꜱᴏɴᴛ ɪɴᴛᴇʀᴅɪᴛꜱ.*" });
        }
    });
};

module.exports = { handleMessage, handleGroupUpdate, isOwner, initializeAntiCall };
