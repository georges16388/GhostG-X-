import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import dotenv from "dotenv";
dotenv.config();

const PREFIX = process.env.PREFIX || "!";

// Commandes avec catégorie, description et usage
const commandsInfo = {
  utils: {
    uptime: { desc: "Affiche le temps de fonctionnement du bot", usage: "uptime" },
    ping: { desc: "Teste si le bot répond", usage: "ping" },
    fancy: { desc: "Stylise ton texte", usage: "fancy <texte>" },
    channelid: { desc: "Affiche l'ID du chat", usage: "channelid" },
  },
  owner: {
    menu: { desc: "Affiche le menu complet du bot", usage: "menu" },
    setpp: { desc: "Change la photo du bot", usage: "setpp" },
    getpp: { desc: "Récupère la photo du bot", usage: "getpp" },
    sudo: { desc: "Ajoute un utilisateur en sudo", usage: "sudo <@tag>" },
  },
  settings: {
    public: { desc: "Active le mode public du bot", usage: "public" },
    setprefix: { desc: "Change le préfixe du bot", usage: "setprefix <nouveau>" },
    autotype: { desc: "Active la saisie automatique", usage: "autotype on/off" },
    autorecord: { desc: "Active l'enregistrement automatique", usage: "autorecord on/off" },
    welcome: { desc: "Active le message de bienvenue", usage: "welcome on/off" },
  },
  media: {
    photo: { desc: "Envoie ou modifie une photo", usage: "photo" },
    toaudio: { desc: "Convertit un média en audio", usage: "toaudio" },
    sticker: { desc: "Crée un sticker", usage: "sticker" },
    play: { desc: "Joue une vidéo YouTube ou audio", usage: "play <lien ou titre>" },
    img: { desc: "Recherche une image", usage: "img <terme>" },
    vv: { desc: "Envoie une vidéo", usage: "vv <vidéo>" },
    save: { desc: "Sauvegarde un média", usage: "save" },
    tiktok: { desc: "Télécharge TikTok", usage: "tiktok <lien>" },
    url: { desc: "Récupère le lien d'un média", usage: "url <lien>" },
  },
  group: {
    tag: { desc: "Tag un membre", usage: "tag <@tag>" },
    tagall: { desc: "Tag tous les membres", usage: "tagall" },
    kick: { desc: "Expulse un membre", usage: "kick <@tag>" },
    mute: { desc: "Mute un membre", usage: "mute <@tag>" },
    unmute: { desc: "Unmute un membre", usage: "unmute <@tag>" },
    antlink: { desc: "Active l'anti lien", usage: "antilink on/off" },
  },
};

// Icônes par catégorie
const categoryIcons = {
  utils: "⚙️",
  owner: "✨",
  settings: "⚡",
  media: "📸",
  group: "👥",
};

export default async function helpCommand(sock, message, args) {
  try {
    const jid = message.key.remoteJid;
    const userId = sock.user.id.split(":")[0];
    const prefix = configmanager.config.users?.[userId]?.prefix || PREFIX;

    if (!args || args.length === 0) {
      // 🔹 Affichage complet par catégorie
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

    // 🔹 Help pour une commande spécifique
    const commandQuery = args[0].toLowerCase();
    let found = false;
    for (const cmds of Object.values(commandsInfo)) {
      if (cmds[commandQuery]) {
        const info = cmds[commandQuery];
        let text = `╔════════════════『 HELP : ${commandQuery} 』════════════════╗\n`;
        text += `┃ ✦ Description : ${info.desc}\n`;
        text += `┃ ✦ Usage : ${prefix}${info.usage}\n`;
        text += `╚═════════════════════════════════════════════════╝`;
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