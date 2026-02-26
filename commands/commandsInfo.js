
import configmanager from "../utils/configmanager.js";
import CONFIG from "../config.js"; // <- import du config manuel

const PREFIX = CONFIG.PREFIX;

// 🔹 Informations sur toutes les commandes
export const commandsInfo = {
  utils: {
    uptime: { usage: `${PREFIX}uptime`, desc: "⏱️ Mesure le temps de survie du système des ténèbres" },
    ping: { usage: `${PREFIX}ping`, desc: "⚡ Vérifie la réactivité des ombres" },
    fancy: { usage: `${PREFIX}fancy <texte>`, desc: "🎨 Transforme votre texte en runes cryptiques" },
    channelid: { usage: `${PREFIX}channelid`, desc: "🔗 Expose l’ID secret du canal ou du sanctuaire" },
    help: { usage: `${PREFIX}help [commande]`, desc: "📜 Liste des artefacts et leur fonction" }
  },

  owner: {
    menu: { usage: `${PREFIX}menu`, desc: "🛠️ Dévoile l’arsenal complet du Ghost Bot" },
    setpp: { usage: `${PREFIX}setpp`, desc: "🖼️ Modifie l’avatar du spectre" },
    getpp: { usage: `${PREFIX}getpp`, desc: "🔍 Inspecte l’avatar d’une entité" },
    sudo: { usage: `${PREFIX}sudo <@>`, desc: "👑 Accorde un pouvoir privilégié à une âme" },
    delsudo: { usage: `${PREFIX}delsudo <@>`, desc: "❌ Révoque un accès aux forces occultes" },
    repo: { usage: `${PREFIX}repo`, desc: "📂 Lien vers le grimoire du code" },
    dev: { usage: `${PREFIX}dev`, desc: "🛡️ Révèle l’identité du Maître des ténèbres" },
    owner: { usage: `${PREFIX}owner`, desc: "👑 Dévoile le gardien de ce spectre" }
  },

  settings: {
    public: { usage: `${PREFIX}public`, desc: "🌐 Active le mode ouverture du sanctuaire" },
    setprefix: { usage: `${PREFIX}setprefix <préfixe>`, desc: "🔧 Redéfinit la clé de commande des ombres" },
    autotype: { usage: `${PREFIX}autotype`, desc: "⌨️ Simule la frappe des esprits" },
    autorecord: { usage: `${PREFIX}autorecord`, desc: "🎙️ Capture automatiquement les murmures" },
    welcome: { usage: `${PREFIX}welcome`, desc: "👋 Initie le rituel de bienvenue des âmes" }
  },

  media: {
    photo: { usage: `${PREFIX}photo`, desc: "📸 Convertit un flux en image spectrale" },
    toaudio: { usage: `${PREFIX}toaudio`, desc: "🎵 Transforme la vidéo en onde des ténèbres" },
    sticker: { usage: `${PREFIX}sticker`, desc: "💠 Forge un talisman sticker depuis le média" },
    play: { usage: `${PREFIX}play <titre>`, desc: "🎶 Invoque un morceau depuis le néant" },
    img: { usage: `${PREFIX}img <texte>`, desc: "🖼️ Génère une image depuis les runes du texte" },
    vv: { usage: `${PREFIX}vv`, desc: "👁️ Télécharge un flux éphémère du spectre" },
    save: { usage: `${PREFIX}save`, desc: "💾 Capture et sécurise un artefact" },
    tiktok: { usage: `${PREFIX}tiktok <lien>`, desc: "🎬 Extrait le flux TikTok du néant" },
    url: { usage: `${PREFIX}url <texte>`, desc: "🔗 Dévoile le lien direct d’un artefact" }
  },

  group: {
    tag: { usage: `${PREFIX}tag`, desc: "📣 Alarme tous les âmes présentes" },
    tagall: { usage: `${PREFIX}tagall`, desc: "📢 Invoque chaque membre et gardien" },
    tagadmin: { usage: `${PREFIX}tagadmin`, desc: "🛡️ Cible uniquement les gardiens du sanctuaire" },
    kick: { usage: `${PREFIX}kick @utilisateur`, desc: "❌ Expulse une entité indésirable" },
    kickall: { usage: `${PREFIX}kickall`, desc: "⚡ Purge toutes les âmes non élues" },
    promote: { usage: `${PREFIX}promote @utilisateur`, desc: "👑 Élévation au rang de gardien du sanctuaire" },
    demote: { usage: `${PREFIX}demote @utilisateur`, desc: "⬇️ Révocation du rang de gardien" },
    mute: { usage: `${PREFIX}mute @utilisateur`, desc: "🔇 Scelle la voix d’une entité" },
    unmute: { usage: `${PREFIX}unmute @utilisateur`, desc: "🔊 Déverrouille la voix d’un membre" },
    gclink: { usage: `${PREFIX}gclink`, desc: "🔗 Dévoile le portail du sanctuaire" },
    antilink: { usage: `${PREFIX}antilink`, desc: "🚫 Neutralise les liens maudits automatiquement" },
    approveall: { usage: `${PREFIX}approveall`, desc: "✅ Accorde l’accès à toutes les âmes candidates" },
    bye: { usage: `${PREFIX}bye`, desc: "👋 Quitte le sanctuaire dans l’ombre" },
    join: { usage: `${PREFIX}join <lien>`, desc: "🔗 Infiltration dans le sanctuaire via lien" },
    add: { usage: `${PREFIX}add @utilisateur`, desc: "➕ Intègre une âme dans l’ordre" }
  },

  moderation: {
    block: { usage: `${PREFIX}block @utilisateur`, desc: "🚫 Bannissement immédiat dans l’ombre" },
    unblock: { usage: `${PREFIX}unblock @utilisateur`, desc: "✅ Réintègre une entité bannie" }
  },

  bug: {
    fuck: { usage: `${PREFIX}fuck`, desc: "🐞 Test ou rapport d’anomalie spectrale" }
  },

  creator: {
    addprem: { usage: `${PREFIX}addprem @utilisateur`, desc: "💎 Accorde le privilège élite" },
    delprem: { usage: `${PREFIX}delprem @utilisateur`, desc: "❌ Révoque le statut élite" }
  },

  premium: {
    ghostscan: { usage: `${PREFIX}ghostscan`, desc: "🌑 Analyse des ombres (réservé aux Premium)" },
    "auto-promote": { usage: `${PREFIX}auto-promote`, desc: "⚡ Promotion automatique (Premium)" },
    "auto-demote": { usage: `${PREFIX}auto-demote`, desc: "⬇️ Rétrogradation automatique (Premium)" },
    "auto-left": { usage: `${PREFIX}auto-left`, desc: "🚪 Quitte automatiquement un groupe (Premium)" }
  }
};

export default commandsInfo;