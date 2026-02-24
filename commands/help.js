import configmanager from "../utils/configmanager.js";
import dotenv from "dotenv";
dotenv.config();

const PREFIX = process.env.PREFIX || "!";

// Liste des commandes avec description et usage
const commandsDescriptions = {
  uptime: { desc: "Affiche le temps de fonctionnement du bot", usage: `${PREFIX}uptime` },
  ping: { desc: "Teste si le bot répond", usage: `${PREFIX}ping` },
  fancy: { desc: "Stylise ton texte", usage: `${PREFIX}fancy <texte>` },
  menu: { desc: "Affiche le menu complet du bot", usage: `${PREFIX}menu` },
  statuswatch: { desc: "Active ou désactive la surveillance des statuts", usage: `${PREFIX}statuswatch on/off` },
  setprefix: { desc: "Change le préfixe du bot", usage: `${PREFIX}setprefix <nouveau>` },
  photo: { desc: "Envoie ou modifie une photo", usage: `${PREFIX}photo` },
  tagall: { desc: "Tag tous les membres d'un groupe", usage: `${PREFIX}tagall` },
  kick: { desc: "Expulse un membre du groupe", usage: `${PREFIX}kick <@tag>` },
  play: { desc: "Joue une vidéo YouTube ou audio", usage: `${PREFIX}play <lien ou titre>` },
  img: { desc: "Recherche une image", usage: `${PREFIX}img <terme>` },
};

export default async function helpCommand(sock, message, args) {
  try {
    const jid = message.key.remoteJid;
    const userId = sock.user.id.split(":")[0];
    const prefix = configmanager.config.users?.[userId]?.prefix || PREFIX;

    if (!args || args.length === 0) {
      // Aucune commande spécifique : afficher toutes les commandes
      let helpText = `╔════════════════『 HELP 』════════════════╗\n`;
      helpText += `▣ Utilise ${prefix}<commande> pour exécuter une commande\n\n`;
      for (const [cmd, info] of Object.entries(commandsDescriptions)) {
        helpText += `┃ ✦ ${cmd} - ${info.desc}\n`;
      }
      helpText += `╚═════════════════════════════════════════╝`;
      await sock.sendMessage(jid, { text: helpText });
      return;
    }

    // Commande spécifique demandée
    const commandQuery = args[0].toLowerCase();
    if (commandsDescriptions[commandQuery]) {
      const info = commandsDescriptions[commandQuery];
      let text = `╔════════════════『 HELP : ${commandQuery} 』════════════════╗\n`;
      text += `┃ ✦ Description : ${info.desc}\n`;
      text += `┃ ✦ Usage : ${info.usage.replace(PREFIX, prefix)}\n`;
      text += `╚═════════════════════════════════════════════════╝`;
      await sock.sendMessage(jid, { text });
    } else {
      await sock.sendMessage(jid, { text: `❌ La commande "${commandQuery}" est inconnue.` });
    }

  } catch (err) {
    console.error("❌ Erreur dans helpCommand:", err);
    await sock.sendMessage(jid, { text: `❌ Impossible d'afficher l'aide : ${err.message}` });
  }
}