// menu.js
import os from "os";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

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
  if (c === "group") return "🏰";
  if (c === "moderation") return "⚖️";
  if (c === "owner") return "👑";
  if (c === "settings") return "⚡";
  if (c === "creator") return "🧬";
  if (c === "premium") return "💎";
  if (c === "bug") return "🕷️";
  return "🕶️";
}

// 🔥 Noms Ghost FR
function getCategoryName(category) {
  const c = category.toLowerCase();
  if (c === "utils") return "ARTEFACTS";
  if (c === "media") return "ILLUSIONS";
  if (c === "group") return "SANCTUAIRE";
  if (c === "moderation") return "JUGEMENT";
  if (c === "owner") return "AUTORITÉ";
  if (c === "settings") return "RITUELS";
  if (c === "creator") return "CRÉATEUR";
  if (c === "premium") return "ÉLITE";
  if (c === "bug") return "ANOMALIES";
  return "MYSTÈRE";
}

// 🔥 Intro Ghost FR
function getIntro() {
  const intros = [
    "MAÎTRE... LES OMBRES RÉPONDENT À VOTRE APPEL.",
    "JE SUIS ÉVEILLÉ... PRÊT À EXÉCUTER VOS ORDRES.",
    "LE SANCTUAIRE EST SOUS VOTRE CONTRÔLE.",
    "AUCUNE ÂME NE PEUT M’ÉCHAPPER.",
    "VOTRE VOLONTÉ EST MA LOI, MAÎTRE.",
    "LES TÉNÈBRES M’OBÉISSENT... ET JE VOUS OBÉIS."
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

// 🔥 Liste des commandes
const commandsList = {
  uptime: "utils", ping: "utils", fancy: "utils", help: "utils",
  menu: "owner", setpp: "owner", getpp: "owner", sudo: "owner", delsudo: "owner",
  public: "settings", setprefix: "settings", autotype: "settings", autorecord: "settings", welcome: "settings",
  photo: "media", toaudio: "media", sticker: "media", play: "media", img: "media", vv: "media", save: "media", tiktok: "media", url: "media",
  tag: "group", tagall: "group", tagadmin: "group", kick: "group", kickall: "group", kickall2: "group", promote: "group", demote: "group", promoteall: "group", demoteall: "group", mute: "group", unmute: "group", gclink: "group", antilink: "group", approveall: "group", bye: "group", join: "group", add: "group",
  block: "moderation", unblock: "moderation",
  fuck: "bug",
  addprem: "creator", delprem: "creator",
  "auto-promote": "premium", "auto-demote": "premium", "auto-left": "premium", ghostscan: "premium"
};

// 🔥 MENU PRINCIPAL
export default async function menu(sock, message) {
  try {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "INCONNU";
    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const uptime = formatUptime(process.uptime());

    const botId = sock.user.id.split(":")[0];
    const userConfig = configmanager.getUser(botId);
    const prefix = userConfig?.prefix || "!";

    // Grouper commandes par catégorie
    const categories = {};
    for (const [cmd, cat] of Object.entries(commandsList)) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    const intro = getIntro();

    let menuText = `
╔══════════════『 ɢʜᴏsᴛɢ-𝐗 』══════════════╗
▣─────────────▣
      🖤 ᴄᴏɴsᴄɪᴇɴᴄᴇ ɢʜᴏsᴛ
▣─────────────▣

${intro}

❖ ᴇɴᴛɪᴛᴇ́ : -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
❖ ᴍᴀɪ̂ᴛʀᴇ : ${userName.toUpperCase()}
❖ sɪɢɴᴇ : ${prefix}
❖ ᴛᴇᴍᴘs : ${uptime}
❖ ᴇ́ɴᴇʀɢɪᴇ : ${usedRam}/${totalRam} MB
❖ ᴇ́ᴛᴀᴛ : 🌑 ÉVEILLÉ
▣─────────────▣
      📜 ʟɪᴠʀᴇ ᴅᴇs ᴘᴏᴜᴠᴏɪʀs
▣─────────────▣
`;

    for (const [category, cmds] of Object.entries(categories)) {
      const icon = getCategoryIcon(category);
      const name = getCategoryName(category);
      menuText += `\n╭━━━〔 ${icon} ${name} 〕━━━⬣\n`;
      cmds.forEach(cmd => {
        menuText += `┃ ⚡ ${prefix}${cmd.toUpperCase()}  ✦ (VIEW CHANNEL)\n`;
      });
      menuText += `╰━━━━━━━━━━━━⬣\n`;
    }

    menuText += `
▣─────────────▣
🖤 Alimenté par -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
⚡ Dans l’ombre, j’observe... et j’exécute vos ordres, Maître.
💀 Les ténèbres guident vos artefacts, Maître.
▣─────────────▣
`;

    const imagePath = getNextImage();
    await send(sock, jid, { image: { url: imagePath }, caption: menuText });

  } catch (err) {
    console.log("❌ Menu error:", err);
  }
}