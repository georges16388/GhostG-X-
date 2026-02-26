// handleIncomingMessage.js
import { PREFIX } from "../config.js";
import ownerRespond from '../commands/ownerRespond.js';
import helpCommand from "../commands/help.js";
import dev from '../commands/dev.js';
import owner from '../commands/owner.js';
import channelid from '../commands/channelid.js';
import configmanager from "../utils/configmanager.js";
import fs from 'fs/promises';
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
import auto from '../commands/auto.js';
import uptime from '../commands/uptime.js';
import stylizedChar from "../utils/fancy.js";

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
    close: "⚡"
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

        console.log('📨 Message:', messageBody.substring(0, 50));

        // -------------------- Auto Features --------------------
        auto.autotype(client, message);
        auto.autorecord(client, message);
        tag.respond(client, message);
        reactions.auto(client, message,
            configmanager.config.users[number]?.autoreact,
            configmanager.config.users[number]?.emoji
        );

        // -------------------- Command Handling --------------------
        if (messageBody.startsWith(prefix) &&
            (publicMode ||
                message.key.fromMe ||
                approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
                lid.includes(message.key.participant || message.key.remoteJid))) {

            const parts = messageBody.slice(prefix.length).trim().split(/\s+/);
            const command = parts[0];
            const args = parts.slice(1);

            // Emoji spécifique pour chaque commande
            const emoji = commandReacts[command] || "👻";

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
                    await media[command](client, message);
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
                    await group[command](client, message);
                    break;

                // ----------------- MODERATION -----------------
                case 'block':
                case 'unblock':
                    await react(client, message, emoji);
                    await block[command](client, message);
                    break;

                // ----------------- BUG -----------------
                case 'fuck':
                case 'close':
                case 'dlt':
                    await react(client, message, emoji);
                    await eval(command)(client, message); // fuck, bug.close, dlt
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
                        await group[command.replace('-', '')](client, message);
                    } else {
                        await send(client, remoteJid, {
                            text: stylizedChar("❌ COMMANDE RÉSERVÉE AUX PREMIUM 🌑")
                        });
                    }
                    break;
            }
        }

        // -------------------- LINK DETECTION --------------------
        await group.linkDetection(client, message);
    }
}

export default handleIncomingMessage;