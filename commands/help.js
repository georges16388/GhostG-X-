import fs from "fs";
import path from "path";
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import fs from "fs";

// 🔥 Lecture manuelle du .env
let BOT_NUMBER = '226XXXX'; // fallback si non défini
let PREFIX = '`';           // préfixe par défaut

if (fs.existsSync('./.env')) {
    const envFile = fs.readFileSync('./.env', 'utf8');
    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return; // ignorer les lignes vides ou les commentaires

        const [key, ...vals] = line.split('=');
        const value = vals.join('=').trim();

        if (key === 'BOT_NUMBER') BOT_NUMBER = value;
        if (key === 'PREFIX') PREFIX = value;
    });
}

// 🔹 Maintenant tu peux utiliser BOT_NUMBER et PREFIX
console.log("Bot number:", BOT_NUMBER);
console.log("Prefix:", PREFIX);

const PREFIX = process.env.PREFIX || "!";

// Icônes par catégorie (à adapter selon tes dossiers)
const categoryIcons = {
  utils: "⚙️",
  owner: "✨",
  settings: "⚡",
  media: "📸",
  group: "👥",
};

// Fonction pour scanner les dossiers et récupérer les commandes
function getCommandsInfo(commandsPath = path.resolve("./commands")) {
  const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const commandsInfo = {};

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".js"));
    commandsInfo[category] = {};

    for (const file of files) {
      try {
        const commandModule = require(path.join(categoryPath, file));
        // Récupérer description et usage depuis le module si définis
        const desc = commandModule.desc || "Pas de description";
        const usage = commandModule.usage || file.replace(".js", "");
        commandsInfo[category][usage] = { desc, usage };
      } catch (err) {
        console.error(`⚠️ Impossible de charger ${file}:`, err.message);
      }
    }
  }

  return commandsInfo;
}

// La commande help auto-générée
export default async function helpCommand(sock, message, args) {
  try {
    const jid = message.key.remoteJid;
    const userId = sock.user.id.split(":")[0];
    const prefix = configmanager.config.users?.[userId]?.prefix || PREFIX;

    const commandsInfo = getCommandsInfo(); // 🔹 Génère le menu automatiquement

    if (!args || args.length === 0) {
      let helpText = `╔════════════════『 HELP 』════════════════╗\n`;
      helpText += `▣ Utilise ${prefix}<commande> pour exécuter une commande\n\n`;

      for (const [cat, cmds] of Object.entries(commandsInfo)) {
        const icon = categoryIcons[cat] || "🎯";
        helpText += `╭━━━〔 ${icon} ${cat.toUpperCase()} 〕━━━⬣\n`;
        for (const [cmd, info] of Object.entries(cmds)) {
          helpText += `┃ ✦ ${prefix}${cmd} - ${info.desc}\n`;
        }
        helpText += `╰━━━━━━━━━━━━⬣\n\n`;
      }

      helpText += `╚═════════════════════════════════════════╝`;
      await send(sock, jid, { text: helpText });
      return;
    }

    // Help pour une commande spécifique
    const commandQuery = args[0].toLowerCase();
    let found = false;
    for (const cmds of Object.values(commandsInfo)) {
      if (cmds[commandQuery]) {
        const info = cmds[commandQuery];
        const text = `╔════════════════『 HELP : ${commandQuery} 』════════════════╗\n` +
                     `┃ ✦ Description : ${info.desc}\n` +
                     `┃ ✦ Usage : ${prefix}${info.usage}\n` +
                     `╚═════════════════════════════════════════════════╝`;
        await send(sock, jid, { text });
        found = true;
        break;
      }
    }

    if (!found) {
      await send(sock, jid, { text: `❌ La commande "${commandQuery}" est inconnue.` });
    }

  } catch (err) {
    console.error("❌ Erreur dans helpCommand:", err);
    await send(sock, jid, { text: `❌ Impossible d'afficher l'aide : ${err.message}` });
  }
}