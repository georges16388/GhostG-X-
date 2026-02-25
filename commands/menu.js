import os from "os";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
import stylizedChar from "../utils/fancy.js";
import send from "../utils/sendMessage.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Images du menu
let currentImageIndex = 0;
const images = [
  "database/menu(0).jpg",
  "database/GhostG-X(0).jpg",
  "database/GhostG.jpg"
];
function getNextImage() {
  const img = images[currentImageIndex];
  currentImageIndex = (currentImageIndex + 1) % images.length;
  return img;
}

// 🔥 Format uptime
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// 🔥 Icônes catégories
function getCategoryIcon(category) {
  const c = category.toLowerCase();
  if (c === "utils") return "⚙️";
  if (c === "media") return "📸";
  if (c === "group") return "👥";
  if (c === "bug") return "🐞";
  if (c === "tags") return "🏷️";
  if (c === "moderation") return "🌪️";
  if (c === "owner") return "✨";
  if (c === "creator") return "👑";
  if (c === "premium") return "💎";
  if (c === "settings") return "⚡";
  return "👍🏾";
}

// 🔥 Liste des commandes
const commandsList = {
  uptime: "utils",
  ping: "utils",
  fancy: "utils",
  channelid: "utils",
  help: "utils",
  menu: "owner",
  setpp: "owner",
  getpp: "owner",
  sudo: "owner",
  delsudo: "owner",
  repo: "owner",
  dev: "owner",
  owner: "owner",
  public: "settings",
  setprefix: "settings",
  autotype: "settings",
  autorecord: "settings",
  welcome: "settings",
  photo: "media",
  toaudio: "media",
  sticker: "media",
  play: "media",
  img: "media",
  vv: "media",
  save: "media",
  tiktok: "media",
  url: "media",
  tag: "group",
  tagall: "group",
  tagadmin: "group",
  kick: "group",
  kickall: "group",
  kickall2: "group",
  promote: "group",
  demote: "group",
  promoteall: "group",
  demoteall: "group",
  mute: "group",
  unmute: "group",
  gclink: "group",
  antilink: "group",
  approveall: "group",
  bye: "group",
  join: "group",
  add: "group",
  block: "moderation",
  unblock: "moderation",
  fuck: "bug",
  addprem: "creator",
  delprem: "creator",
  "auto-promote": "premium",
  "auto-demote": "premium",
  "auto-left": "premium",
};

export default async function info(sock, message) {
  try {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "Unknown";

    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const uptime = formatUptime(process.uptime());

    const botId = sock.user.id.split(":")[0];
    const prefix = configs.config.users?.[botId]?.prefix || "!";

    // 🔥 Regrouper les commandes
    const categories = {};
    for (const [cmd, cat] of Object.entries(commandsList)) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    // 🔥 Construire menu premium
    let menu = `
╔════════════════『 ɢʜᴏsᴛɢ-𝐗 』════════════════╗
▣─────────────▣
        ⚡ ʙᴏᴛ ᴅᴀsʜʙᴏᴀʀᴅ
▣─────────────▣

❖ ɴᴀᴍᴇ : -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
❖ ᴜsᴇʀ : ${stylizedChar(userName)}
❖ ᴘʀᴇғɪx : ${prefix}
❖ ᴜᴘᴛɪᴍᴇ : ${uptime}
❖ ʀᴀᴍ : ${usedRam}/${totalRam} MB
❖ ᴍᴏᴅᴇ : 🌑 ɴɪɢʜᴛ

▣─────────────▣
       📜 ᴄᴏᴍᴍᴀɴᴅs
▣─────────────▣
`;

    for (const [category, cmds] of Object.entries(categories)) {
      const icon = getCategoryIcon(category);
      const name = stylizedChar(category);

      menu += `

╭━━━〔 ${icon} ${name} 〕━━━⬣
`;
      cmds.forEach(cmd => {
        menu += `┃ ✦ ${stylizedChar(cmd)}\n`;
      });
      menu += `╰━━━━━━━━━━━━⬣\n`;
    }

    // 🔥 Signature premium
    menu += `

 > ©-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ 2026
`;

    const imagePath = getNextImage();
await send(sock, jid, { 
  image: { url: imagePath },
  caption: menu
});

  } catch (err) {
    console.log("❌ Error displaying menu:", err);
  }
}