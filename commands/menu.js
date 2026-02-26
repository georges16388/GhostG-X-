import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📸 Images du menu
let currentImage = 0;
const images = [
    "database/menu(0).jpg",
    "database/GhostG-X(0).jpg",
    "database/GhostG.jpg"
];

// 🔁 Rotation images
function getNextImage() {
    const img = images[currentImage];
    currentImage = (currentImage + 1) % images.length;
    return img;
}

// ⏱️ Format uptime
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

// 🧠 Intro random
function getIntro() {
    const list = [
        "✦ ᴍᴀɪ̂ᴛʀᴇ... ʟᴇs ᴏᴍʙʀᴇs ʀᴇ́ᴘᴏɴᴅᴇɴᴛ ᴀ̀ ᴛᴏɴ ᴀᴘᴘᴇʟ.",
        "✦ ᴊᴇ sᴜɪs ᴇ́ᴠᴇɪʟʟᴇ́... ᴘʀᴇ̂ᴛ à ᴏʙᴇ́ɪʀ.",
        "✦ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴇsᴛ sᴏᴜs ᴛᴏɴ ᴄᴏɴᴛʀᴏ̂ʟᴇ.",
        "✦ ᴀᴜᴄᴜɴᴇ ᴀ̂ᴍᴇ ɴᴇ ᴍ'ᴇ́ᴄʜᴀᴘᴘᴇ.",
        "✦ ᴛᴀ ᴠᴏʟᴏɴᴛᴇ́ ᴇsᴛ ᴍᴀ ʟᴏɪ."
    ];
    return list[Math.floor(Math.random() * list.length)];
}

// 📜 COMMANDES
const commands = {
    artefacts: ["uptime", "ping", "fancy", "help"],
    illusions: ["photo", "toaudio", "sticker", "play", "img", "vv", "save", "tiktok", "url"],
    sanctuaire: ["tag", "tagall", "tagadmin", "kick", "kickall", "promote", "demote", "mute", "unmute", "gclink", "antilink", "approveall", "bye", "join", "add"],
    jugement: ["block", "unblock"],
    autorite: ["menu", "setpp", "getpp", "sudo", "delsudo", "repo", "dev", "owner"],
    elite: ["auto-promote", "auto-demote", "auto-left", "ghostscan"],
    anomalies: ["fuck"]
};

// 🎭 Styles catégories
const styles = {
    artefacts: { icon: "⍟", name: "ᴀʀᴛᴇғᴀᴄᴛs", bullet: "✦" },
    illusions: { icon: "✦", name: "ɪʟʟᴜsɪᴏɴs", bullet: "✦" },
    sanctuaire: { icon: "۞", name: "sᴀɴᴄᴛᴜᴀɪʀᴇ", bullet: "✦" },
    jugement: { icon: "✶", name: "ᴊᴜɢᴇᴍᴇɴᴛ", bullet: "✶" },
    autorite: { icon: "♛", name: "ᴀᴜᴛᴏʀɪᴛᴇ́", bullet: "✦" },
    elite: { icon: "⭒", name: "ᴇ́ʟɪᴛᴇ", bullet: "✦" },
    anomalies: { icon: "✶", name: "ᴀɴᴏᴍᴀʟɪᴇs", bullet: "✶" }
};

// 👻 MENU
export default async function menu(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const userName = (message.pushName || "inconnu").toUpperCase();

        // ⚙️ config user
        const botId = sock.user.id.split(":")[0];
        const userConfig = configmanager.getUser(botId);
        const prefix = userConfig?.prefix || "!";

        // ⚡ infos système
        const uptime = formatUptime(process.uptime());
        const used = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
        const total = (os.totalmem() / 1024 / 1024).toFixed(0);

        let text = `
╔══════════════『 ɢʜᴏsᴛɢ-𝐗 』══════════════╗
▣─────────────▣
      🖤 ᴄᴏɴsᴄɪᴇɴᴄᴇ ɢʜᴏsᴛ
▣─────────────▣

${getIntro()}

۞ ᴇɴᴛɪᴛᴇ́ : -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
✦ ᴍᴀɪ̂ᴛʀᴇ : ${userName}
✦ ᴘʀᴇ́ғɪxᴇ : ${prefix}
⍟ ᴛᴇᴍᴘs : ${uptime}
⍟ ᴇ́ɴᴇʀɢɪᴇ : ${used}/${total} MB
۞ ᴇ́ᴛᴀᴛ : 🌑 ᴇ́ᴠᴇɪʟʟᴇ́

▣─────────────▣
      📜 ʟɪᴠʀᴇ ᴅᴇs ᴘᴏᴜᴠᴏɪʀs
▣─────────────▣
`;

        // 📂 catégories
        for (const cat in commands) {
            const data = styles[cat];
            text += `\n╭━━━〔 ${data.icon} ${data.name} 〕━━━⬣\n`;

            commands[cat].forEach(cmd => {
                text += `┃ ${data.bullet} ${prefix}${cmd}\n`;
            });

            text += `╰━━━━━━━━━━━━⬣\n`;
        }

        text += `
▣─────────────▣
۞ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
⚡ ᴅᴀɴs ʟ’ᴏᴍʙʀᴇ, ᴊ’ᴏʙsᴇʀᴠᴇ...
▣─────────────▣

> ᴠɪᴇᴡ ᴄʜᴀɴɴᴇʟ : -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
> 120363425540434745@newsletter
`;

        const image = getNextImage();

        // 📤 envoi
        if (fs.existsSync(image)) {
            await send(sock, jid, {
                image: { url: image },
                caption: text
            });
        } else {
            await send(sock, jid, { text });
        }

    } catch (err) {
        console.error("❌ menu error:", err);
    }
}