// help.js
import commandsInfo from "./commandsInfo.js"; // Objet avec toutes les commandes et leurs infos
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import CONFIG from "../config.js";
const PREFIX = CONFIG.PREFIX;

export default async function help(client, message, args) {
    const jid = message.key.remoteJid;
    const botId = client.user.id.split(":")[0];
    const userConfig = configmanager.getUser(botId);
    const prefix = userConfig?.prefix || CONFIG.PREFIX;

    // ---------- 1️⃣ Commande spécifique ----------
    const commandName = args[0]?.toLowerCase();
    if (commandName) {
        let found = false;
        for (const category in commandsInfo) {
            const categoryCommands = commandsInfo[category];
            if (categoryCommands[commandName]) {
                const cmd = categoryCommands[commandName];
                const text = `
╔══════════════『 ${CONFIG.BOT_NAME.toUpperCase()} 』══════════════╗
📌 COMMANDE : ${PREFIX}${cmd.usage}
📝 DESCRIPTION : ${cmd.desc}
🗂️ CATÉGORIE : ${category.toUpperCase()}
✦ UTILISATION : ${PREFIX}${cmd.usage}
╚═════════════════════════════════════╝

> VIEW CHANNEL : ${CONFIG.CHANNEL_NAME}
> ${CONFIG.CHANNEL_ID}
`;
                await send(client, jid, { text });
                found = true;
                break;
            }
        }

        if (!found) {
            // Si la commande n'existe pas, affiche quand même toutes les commandes
            await send(client, jid, { text: await buildFullHelp(prefix) });
        }
        return;
    }

    // ---------- 2️⃣ Toutes les commandes ----------
    const fullHelpText = await buildFullHelp(prefix);
    await send(client, jid, { text: fullHelpText });
}

// ---------- Fonction pour construire le help complet ----------
async function buildFullHelp(prefix) {
    let text = `╔══════════════『 ${CONFIG.BOT_NAME.toUpperCase()} 』══════════════╗
▣─────────────▣
          📜 COMMANDES DE L'ULTIME BOT 💀
▣─────────────▣
`;

    for (const category in commandsInfo) {
        const catName = category.toUpperCase();
        const icon = getCategoryIcon(category);
        text += `\n╭━━━〔 ${icon} ${catName} 〕━━━⬣\n`;

        const categoryCommands = commandsInfo[category];
        for (const cmdName in categoryCommands) {
            text += `┃ ✦ ${prefix}${cmdName}\n`;
        }

        text += `╰━━━━━━━━━━━━⬣\n`;
    }

    text += `
▣─────────────▣
۞ ${CONFIG.CHANNEL_NAME}
⚡ DANS L’OMBRE, J’OBSERVE ET J’EXÉCUTE VOS ORDRES
▣─────────────▣

> VIEW CHANNEL : ${CONFIG.CHANNEL_NAME}
> ${CONFIG.CHANNEL_ID}
`;
    return text;
}

// ---------- Icones catégories ----------
function getCategoryIcon(category) {
    const icons = {
        artefacts: "⍟",
        illusions: "✦",
        sanctuaire: "۞",
        jugement: "✶",
        autorite: "♛",
        elite: "⭒",
        anomalies: "✶"
    };
    return icons[category] || "✦";
}