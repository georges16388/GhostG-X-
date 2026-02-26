// help.js
import commandsInfo from "./commandsInfo.js";
import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

export default async function help(client, message, args) {
  const botId = client.user.id.split(":")[0]; // ID du bot
  const botConfig = configmanager.getUser(botId); // ✅ récupère la config du bot
  const prefix = botConfig?.prefix || "!"; // fallback si pas défini

  const commandName = args[0]?.toLowerCase(); // commande ciblée

  // ---------- 1️⃣ Commande spécifique ----------
  if (commandName) {
    for (const category in commandsInfo) {
      const categoryCommands = commandsInfo[category];
      if (categoryCommands[commandName]) {
        const cmd = categoryCommands[commandName];
        const text = `📌 Commande : ${prefix}${cmd.usage}\n📝 Description : ${cmd.desc}\n🗂️ Catégorie : ${category.toUpperCase()}`;
        return await send(client, message.key.remoteJid, text);
      }
    }
    return await send(client, message.key.remoteJid, `⚠️ La commande "${commandName}" est introuvable.`);
  }

  // ---------- 2️⃣ Affiche toutes les commandes ----------
  let text = `╔════════════════『 ɢʜᴏsᴛɢ-𝐗 』════════════════╗\n`;
  text += `▣─────────────▣\n`;
  text += `          📜 COMMANDES DE L'ULTIME BOT 💀\n`;
  text += `▣─────────────▣\n\n`;

  for (const category in commandsInfo) {
    text += `╭━━━〔 ${category.toUpperCase()} 〕━━━⬣\n`;
    const categoryCommands = commandsInfo[category];

    for (const cmdName in categoryCommands) {
      const cmd = categoryCommands[cmdName];
      // Format: prefix + commande : description
      text += `┃ ${prefix}${cmd.usage} : ${cmd.desc}\n`;
    }
    text += `╰━━━━━━━━━━━━⬣\n\n`;
  }

  text += ` > Préfixe actuel : ${prefix}\n`;
  text += ` > ©-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ 💀`;

  await send(client, message.key.remoteJid, text);
}