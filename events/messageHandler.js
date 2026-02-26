// handleIncomingMessage.js
import CONFIG from "../config.js";
const PREFIX = CONFIG.PREFIX;
import ownerRespond from '../commands/ownerRespond.js';
import helpCommand from "../commands/help.js";
import dev from '../commands/dev.js';
import owner from '../commands/owner.js';
import channelid from '../commands/channelid.js';
import configmanager from "../utils/configmanager.js";
import group from '../commands/group.js';
import block from '../commands/block.js';
import viewonce from '../commands/viewonce.js';
import tiktok from '../commands/tiktok.js';
import play from '../commands/play.js';
import sudo from '../commands/sudo.js';
import tag from '../commands/tag.js';
import take from '../commands/take.js';
import sticker from '../commands/sticker.js';
import img from '../commands/img.js';
import url from '../commands/url.js';
import sender from '../commands/sender.js';
import fuck from '../commands/fuck.js';
import bug from '../commands/bug.js';
import dlt from '../commands/dlt.js';
import save from '../commands/save.js';
import pp from '../commands/pp.js';
import premiums from '../commands/premiums.js';
import reactions from '../commands/reactions.js';
import media from '../commands/media.js';
import set from '../commands/set.js';
import fancy from '../commands/fancy.js';
import react from "../utils/react.js";
import info from "../commands/menu.js";
import { pingTest } from "../commands/ping.js";
import uptime from '../commands/uptime.js';
import stylizedChar from "../utils/fancy.js";
import send from "../utils/sendMessage.js";

// -------------------- Vérification Premium --------------------
function isPremium(jid) {
    const list = Array.isArray(configmanager.premiums) ? configmanager.premiums : [];
    return list.includes(jid);
}

// -------------------- Mapping Emojis Ghost --------------------
const commandReacts = {
    uptime: "⏱️",
    help: "📜",
    ping: "🏓",
    menu: "📖",
    fancy: "✨",
    setpp: "🖼️",
    getpp: "🖼️",
    sudo: "⚡",
    delsudo: "❌",
    repo: "🔗",
    dev: "👨‍💻",
    owner: "👑",
    kick: "💀",
    tag: "🎯",
    block: "🛑",
    unblock: "✅",
    photo: "📷",
    toaudio: "🎧",
    sticker: "🖼️",
    play: "🎵",
    img: "🖌️",
    vv: "👁️",
    save: "💾",
    tiktok: "🎬",
    url: "🔗",
    autoPromote: "⬆️",
    autoDemote: "⬇️",
    autoLeft: "🚪",
    ghostscan: "🔮",
    fuck: "💢",
    close: "⚡",
    dlt: "🗑️"
};

// -------------------- Handler Principal --------------------
async function handleIncomingMessage(client, event) {
    const lid = client?.user?.lid.split(':')[0] + '@lid';
    const number = client.user.id.split(':')[0];
    const messages = event.messages;
    const publicMode = configmanager.config.users[number]?.publicMode || false;
    const prefix = configmanager.config.users[number]?.prefix || PREFIX;
    const approvedUsers = configmanager.config.users[number]?.sudoList || [];

    for (const message of messages) {
        const messageBody = (message.message?.extendedTextMessage?.text ||
            message.message?.conversation || '').toLowerCase();
        const remoteJid = message.key.remoteJid;

        if (!messageBody || !remoteJid) continue;

        console.log(`📨 Message reçu de ${remoteJid}: ${messageBody.substring(0, 50)}`);

        // -------------------- PRIORITÉ PROPRIÉTAIRE --------------------
        try {
            const handledByOwner = await ownerRespond(client, message);
            if (handledByOwner) continue;
        } catch (err) {
            console.error('❌ Erreur ownerRespond:', err);
        }

        // -------------------- COMMAND HANDLING --------------------
        if (messageBody.startsWith(prefix) &&
            (publicMode ||
                message.key.fromMe ||
                approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
                lid.includes(message.key.participant || message.key.remoteJid))) {

            const parts = messageBody.slice(prefix.length).trim().split(/\s+/);
            const command = parts[0];
            const args = parts.slice(1);
            const emoji = commandReacts[command] || "👻";

            try {
                switch (command) {

                    // ----------------- UTILS -----------------
                    case 'uptime':
                        await react(client, message, emoji);
                        await uptime(client, message);
                        break;

                    case 'help':
                        await react(client, message, emoji);
                        await helpCommand(client, message, args);
                        break;

                    case 'ping':
                        await react(client, message, emoji);
                        await pingTest(client, message);
                        break;

                    case 'menu':
                        await react(client, message, emoji);
                        await info(client, message);
                        break;

                    case 'fancy':
                        await react(client, message, emoji);
                        await fancy(client, message);
                        break;

                    case 'setpp':
                        await react(client, message, emoji);
                        await pp.setpp(client, message);
                        break;

                    case 'getpp':
                        await react(client, message, emoji);
                        await pp.getpp(client, message);
                        break;

                    // ----------------- OWNER -----------------
                    case 'sudo':
                        await react(client, message, emoji);
                        await sudo.sudo(client, message, approvedUsers);
                        configmanager.save();
                        break;

                    case 'delsudo':
                        await react(client, message, emoji);
                        await sudo.delsudo(client, message, approvedUsers);
                        configmanager.save();
                        break;

                    case 'repo':
                        await react(client, message, emoji);
                        await client.sendMessage(remoteJid, {
                            text: stylizedChar("🔗 VOICI LE REPO DU BOT : HTTPS://GITHUB.COM/GEORGES16388/GHOSTG-X-.GIT")
                        }, { quoted: message });
                        break;

                    case 'dev':
                        await react(client, message, emoji);
                        await dev(client, message);
                        break;

                    case 'owner':
                        await react(client, message, emoji);
                        await owner(client, message);
                        break;

                    // ----------------- SETTINGS -----------------
                    case 'setprefix':
                        await react(client, message, emoji);
                        await set.setprefix(message, client);
                        break;

                    case 'autotype':
                        await react(client, message, emoji);
                        await set.setautotype(message, client);
                        break;

                    case 'public':
                        await react(client, message, emoji);
                        await set.isPublic(message, client);
                        break;

                    case 'autorecord':
                        await react(client, message, emoji);
                        await set.setautorecord(message, client);
                        break;

                    case 'welcome':
                        await react(client, message, emoji);
                        await set.setwelcome(message, client);
                        break;

                    // ----------------- MEDIA -----------------
                    case 'photo':
                    case 'toaudio':
                    case 'sticker':
                    case 'play':
                    case 'img':
                    case 'vv':
                    case 'save':
                    case 'tiktok':
                    case 'url':
                        await react(client, message, emoji);
                        if (typeof media[command] === 'function') await media[command](client, message);
                        break;

                    // ----------------- GROUP -----------------
                    case 'tag':
                    case 'tagall':
                    case 'tagadmin':
                    case 'kick':
                    case 'kickall':
                    case 'kickall2':
                    case 'promote':
                    case 'demote':
                    case 'promoteall':
                    case 'demoteall':
                    case 'approveall':
                    case 'mute':
                    case 'unmute':
                    case 'gclink':
                    case 'antilink':
                    case 'bye':
                    case 'join':
                        await react(client, message, emoji);
                        if (typeof group[command] === 'function') await group[command](client, message);
                        break;

                    // ----------------- MODERATION -----------------
                    case 'block':
                    case 'unblock':
                        await react(client, message, emoji);
                        if (typeof block[command] === 'function') await block[command](client, message);
                        break;

                    // ----------------- BUG -----------------
                    case 'fuck':
                        await react(client, message, emoji);
                        await fuck(client, message);
                        break;

                    case 'close':
                        await react(client, message, emoji);
                        await bug(client, message);
                        break;

                    case 'dlt':
                        await react(client, message, emoji);
                        await dlt(client, message);
                        break;

                    // ----------------- PREMIUM -----------------
                    case 'addprem':
                    case 'delprem':
                        await react(client, message, emoji);
                        await premiums[command](client, message);
                        break;

                    case 'ghostscan':
                    case 'auto-promote':
                    case 'auto-demote':
                    case 'auto-left':
                        await react(client, message, emoji);
                        if (isPremium(message.key.participant || message.key.remoteJid)) {
                            const fnName = command.replace(/-/g, '');
                            if (typeof group[fnName] === 'function') await group[fnName](client, message);
                        } else {
                            await send(client, remoteJid, {
                                text: stylizedChar("❌ COMMANDE RÉSERVÉE AUX PREMIUM 🌑")
                            });
                        }
                        break;
                }
            } catch (err) {
                console.error(`❌ Erreur traitement commande ${command}:`, err);
            }
        }

        // -------------------- LINK DETECTION --------------------
        try {
            await group.linkDetection(client, message);
        } catch (err) {
            console.error('❌ Erreur linkDetection :', err);
        }
    }
}

export default handleIncomingMessage;