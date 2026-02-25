import fs from "fs";
import path from "path";
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

// 🔥 Lecture manuelle du .env (fallback si inexistant)
let BOT_NUMBER = '226XXXX';
let PREFIX = '`';

if (fs.existsSync('./.env')) {
    const envFile = fs.readFileSync('./.env', 'utf8');
    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const [key, ...vals] = line.split('=');
        const value = vals.join('=').trim();

        if (key === 'BOT_NUMBER') BOT_NUMBER = value;
        if (key === 'PREFIX') PREFIX = value;
    });
}

// Icônes par catégorie
const categoryIcons = {
  utils: "⚙️",
  owner: "✨",
  settings: "⚡",
  media: "📸",
  group: "👥",
};

// 🔹 Fonction pour scanner les dossiers et générer automatiquement le menu
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
                // Importer le module de commande
                const commandModule = await import(path.join(categoryPath, file));
                // Récupérer description et usage si définis
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

// 🔹 La commande help auto-générée
export default async function helpCommand(sock, message, args) {
    const jid = message.key.remoteJid;
    const userId = sock.user.id.split(":")[0];
    const prefix = configmanager.config.users?.[userId]?.prefix || PREFIX;

    try {
        const commandsInfo = await getCommandsInfo();

        // Aucun argument → afficher le menu complet
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

        // Argument → afficher l'aide d'une commande spécifique
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