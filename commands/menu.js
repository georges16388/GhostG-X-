import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
import { getDevice } from "baileys";
import stylizedChar from "../utils/fancy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function getCategoryIcon(category) {
  const c = category.toLowerCase();
  if (c === "utils") return "⚙️";
  if (c === "media") return "📸";
  if (c === "group") return "👥";
  if (c === "bug") return "🐞";
  if (c === "tags") return "🏷️";
  if (c === "moderation") return "😶‍🌫️";
  if (c === "owner") return "✨";
  if (c === "creator") return "👑";
  if (c === "premium") return "💎";
  return "🎯"; 
}

// Liste complète des commandes et catégories
const commandsList = {
  uptime: "utils",
  ping: "utils",
  menu: "owner",
  fancy: "utils",
  setpp: "owner",
  getpp: "owner",
  sudo: "owner",
  delsudo: "owner",
  public: "owner",
  setprefix: "owner",
  autotype: "owner",
  autorecord: "owner",
  welcome: "owner",
  photo: "media",
  toaudio: "media",
  sticker: "media",
  play: "media",
  img: "media",
  vv: "media",
  save: "media",
  tiktok: "media",
  url: "media",
  tag: "tags",
  tagall: "tags",
  tagadmin: "tags",
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
  antimentiongc: "group",
  bye: "group",
  block: "moderation",
  unblock: "moderation",
  fuck: "moderation",
  addprem: "premium",
  delprem: "premium",
  "auto-promote": "premium",
  "auto-demote": "premium",
  "auto-left": "premium",
  join: "owner",
};

export default async function info(client, message) {
  try {
    const remoteJid = message.key.remoteJid;
    const userName = message.pushName || "Unknown";

    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const uptime = formatUptime(process.uptime());
    const platform = os.platform();

    const botId = client.user.id.split(":")[0];
    const prefix = configs.config.users?.[botId]?.prefix || "!";

    const now = new Date();
    const daysFR = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const day = daysFR[now.getDay()];

    // Regrouper les commandes par catégorie
    const categories = {};
    for (const [cmd, cat] of Object.entries(commandsList)) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    // Construire le menu
    let menu = `
⏤͟͟͞ＧＨＯＳＴＧ－Ｘ 🎯
────────────
• Prefix   : ${prefix}
• User     : ${stylizedChar(userName)}
• Version  : 1.0.0
• Uptime   : ${uptime}
• RAM      : ${usedRam}/${totalRam} MB
• Platform : ${platform}
• Date     : ${date} - ${stylizedChar(day)}
────────────
`;

    for (const [category, commands] of Object.entries(categories)) {
      const icon = getCategoryIcon(category);
      const catName = stylizedChar(category);
      menu += `┏━━━ ${icon} ${catName} ━━━\n`;
      commands.forEach(cmd => {
        menu += `┃   › ${stylizedChar(cmd)}\n`;
      });
      menu += `┗━━━━━━━━━━━━━━━\n`;
    }

    menu = menu.trim();

    // Envoyer le menu
    try {
      const device = getDevice(message.key.id);

      if (device === "android") {
        await client.sendMessage(remoteJid, {
          image: { url: "database/menu.jpg" },
          caption: menu
        });
      } else {
        await client.sendMessage(remoteJid, {
          video: { url: "database/DigiX.mp3" },
          caption: menu
        }, { quoted: message });
      }
    } catch (err) {
      await client.sendMessage(remoteJid, { text: "❌ Erreur lors de l'envoi du menu : " + err.message }, { quoted: message });
    }

    console.log(menu);
  } catch (err) {
    console.log("error while displaying menu:", err);
  }
}