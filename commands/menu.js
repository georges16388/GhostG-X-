
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
import stylizedChar from "../commands/fancy.js";
import send from "../utils/sendMessage.js";

// Pour gérer __dirname
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

// 🔥 Liste commandes (exemple)
const commandsList = {
  uptime: "utils", ping: "utils", fancy: "utils", help: "utils",
  menu: "owner", setpp: "owner", getpp: "owner", sudo: "owner", delsudo: "owner",
  public: "settings", setprefix: "settings", autotype: "settings",
  photo: "media", sticker: "media", play: "media", img: "media",
  tag: "group", kick: "group", promote: "group", demote: "group",
  block: "moderation", unblock: "moderation",
  addprem: "creator", delprem: "creator",
  "auto-promote": "premium", "auto-demote": "premium", ghostscan: "premium"
};

// 🔥 MENU principal
export default async function info(sock, message) {
  try {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "Inconnu";
    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const uptime = formatUptime(process.uptime());
    const botId = sock.user.id.split(":")[0];
    
    // ✅ prefix depuis configmanager
    const botConfig = configs.getUser(botId);
    const prefix = botConfig?.prefix || "!";

    // Grouper commandes par catégorie
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

❖ ᴍᴀɪ̂ᴛʀᴇ : ${stylizedChar(userName)}
❖ sɪɢɴᴇ : ${prefix}
❖ ᴛᴇᴍᴘs : ${uptime}
❖ ᴇ́ɴᴇʀɢɪᴇ : ${usedRam}/${totalRam} MB
❖ ᴇ́ᴛᴀᴛ : 🌑 Éveillé

▣─────────────▣
      📜 ʟɪᴠʀᴇ ᴅᴇs ᴘᴏᴜᴠᴏɪʀs
▣─────────────▣
`;

    // Ajoute les commandes par catégorie
    for (const [category, cmds] of Object.entries(categories)) {
      const icon = getCategoryIcon(category);
      const name = stylizedChar(getCategoryName(category));
      menu += `\n╭━━━〔 ${icon} ${name} 〕━━━⬣\n`;
      cmds.forEach(cmd => menu += `┃ ⚡ ${prefix}${stylizedChar(cmd)} ✦\n`);
      menu += `╰━━━━━━━━━━━━⬣\n`;
    }

    // Footer
    menu += `
▣─────────────▣
🖤 Alimenté par -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
⚡ Dans l’ombre, j’observe... et j’exécute vos ordres, Maître.
💀 Les ténèbres guident vos artefacts, Maître.
▣─────────────▣
`;

    // Image aléatoire
    const imagePath = getNextImage();
    const messageOptions = fs.existsSync(imagePath)
      ? { image: { url: imagePath }, caption: menu }
      : { text: menu };

    await send(sock, jid, messageOptions);

  } catch (err) {
    console.error("❌ Menu error:", err);
  }
}