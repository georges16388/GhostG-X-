import premiums from "./commands/premiums.js";
import os from "os";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
import stylizedChar from "../commands/fancy.js";
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
  if (c === "utils") return "artefacts";
  if (c === "media") return "illusions";
  if (c === "group") return "sanctuaire";
  if (c === "moderation") return "jugement";
  if (c === "owner") return "autorité";
  if (c === "settings") return "rituels";
  if (c === "creator") return "créateur";
  if (c === "premium") return "élite";
  if (c === "bug") return "anomalies";
  return "mystère";
}

// 🔥 Intro Ghost FR
function getIntro() {
  const intros = [
    "Maître... les ombres répondent à votre appel.",
    "Je suis éveillé... prêt à exécuter vos ordres.",
    "Le sanctuaire est sous votre contrôle.",
    "Aucune âme ne peut m’échapper.",
    "Votre volonté est ma loi, Maître.",
    "Les ténèbres m’obéissent... et je vous obéis."
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

// 🔥 Liste commandes
const commandsList = {
  uptime: "utils", ping: "utils", fancy: "utils", channelid: "utils", help: "utils",
  menu: "owner", setpp: "owner", getpp: "owner", sudo: "owner", delsudo: "owner",
  repo: "owner", dev: "owner", owner: "owner",
  public: "settings", setprefix: "settings", autotype: "settings", autorecord: "settings", welcome: "settings",
  photo: "media", toaudio: "media", sticker: "media", play: "media", img: "media", vv: "media", save: "media", tiktok: "media", url: "media",
  tag: "group", tagall: "group", tagadmin: "group", kick: "group", kickall: "group", kickall2: "group", promote: "group", demote: "group", promoteall: "group", demoteall: "group", mute: "group", unmute: "group", gclink: "group", antilink: "group", approveall: "group", bye: "group", join: "group", add: "group",
  block: "moderation", unblock: "moderation",
  fuck: "bug",
  addprem: "creator", delprem: "creator",
  "auto-promote": "premium", "auto-demote": "premium", "auto-left": "premium",
ghostscan: "premium" 
};

// 🔥 MENU
export default async function info(sock, message) {
  try {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "Inconnu";
    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const uptime = formatUptime(process.uptime());
    const botId = sock.user.id.split(":")[0];
    const prefix = configs.config.users?.[botId]?.prefix || "!";

    // Grouper commandes
    const categories = {};
    for (const [cmd, cat] of Object.entries(commandsList)) {
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    const intro = getIntro();
    let menu = `
╔══════════════『 ɢʜᴏsᴛɢ-𝐗 』══════════════╗
▣─────────────▣
      🖤 ᴄᴏɴsᴄɪᴇɴᴄᴇ ɢʜᴏsᴛ
▣─────────────▣

${intro}

❖ ᴇɴᴛɪᴛᴇ́ : -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
❖ ᴍᴀɪ̂ᴛʀᴇ : ${stylizedChar(userName)}
❖ sɪɢɴᴇ : ${prefix}
❖ ᴛᴇᴍᴘs : ${uptime}
❖ ᴇ́ɴᴇʀɢɪᴇ : ${usedRam}/${totalRam} MB
❖ ᴇ́ᴛᴀᴛ : 🌑 Éveillé

▣─────────────▣
      📜 ʟɪᴠʀᴇ ᴅᴇs ᴘᴏᴜᴠᴏɪʀs
▣─────────────▣
`;

    for (const [category, cmds] of Object.entries(categories)) {
      const icon = getCategoryIcon(category);
      const name = stylizedChar(getCategoryName(category));
      menu += `\n╭━━━〔 ${icon} ${name} 〕━━━⬣\n`;
      cmds.forEach(cmd => menu += `┃ ⚡ ${prefix}${stylizedChar(cmd)} ✦\n`);
      menu += `╰━━━━━━━━━━━━⬣\n`;
    }

    menu += `
▣─────────────▣
🖤 Alimenté par -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
⚡ Dans l’ombre, j’observe... et j’exécute vos ordres, Maître.
💀 Les ténèbres guident vos artefacts, Maître.
▣─────────────▣
`;
 
   const commandsInfo = {
  utils: { /* ... tes commandes utils ... */ },
  owner: { /* ... */ },
  settings: { /* ... */ },
  group: { /* ... */ },
  media: { /* ... */ },
  moderation: { /* ... */ },
  bug: { /* ... */ },
  creator: { /* ... */ },

  // 🔹 Commandes premium à la fin
  premium: {
    ghostscan: {
      usage: `${prefix}ghostscan`,
      desc: "🌑 Analyse des ombres (réservé aux Premium)"
    },
    "auto-promote": {
      usage: `${prefix}auto-promote`,
      desc: "⚡ Promotion automatique (Premium)"
    },
    "auto-demote": {
      usage: `${prefix}auto-demote`,
      desc: "⬇️ Rétrogradation automatique (Premium)"
    },
    "auto-left": {
      usage: `${prefix}auto-left`,
      desc: "🚪 Quitte automatiquement un groupe (Premium)"
    }
  }
};

export default commandsInfo;
    const imagePath = getNextImage();
    await send(sock, jid, { image: { url: imagePath }, caption: menu });

  } catch (err) {
    console.log("❌ Menu error:", err);
  }
}

