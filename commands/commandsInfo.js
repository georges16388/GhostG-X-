import configmanager from "../utils/configmanager.js";
import { PREFIX } from '../connectToWhatsApp.js'; // chemin relatif correct

// Utilisation
if (message.body.startsWith(PREFIX + 'antilink')) {
    // ton code ici
}

// puis
const prefix = PREFIX;

// 🔹 Informations sur toutes les commandes
export const commandsInfo = {
  utils: {
    uptime: { usage: `${prefix}uptime`, desc: "⏱️ Mesure le temps de survie du système des ténèbres" },
    ping: { usage: `${prefix}ping`, desc: "⚡ Vérifie la réactivité des ombres" },
    fancy: { usage: `${prefix}fancy <texte>`, desc: "🎨 Transforme votre texte en runes cryptiques" },
    channelid: { usage: `${prefix}channelid`, desc: "🔗 Expose l’ID secret du canal ou du sanctuaire" },
    help: { usage: `${prefix}help [commande]`, desc: "📜 Liste des artefacts et leur fonction" }
  },

  owner: {
    menu: { usage: `${prefix}menu`, desc: "🛠️ Dévoile l’arsenal complet du Ghost Bot" },
    setpp: { usage: `${prefix}setpp`, desc: "🖼️ Modifie l’avatar du spectre" },
    getpp: { usage: `${prefix}getpp`, desc: "🔍 Inspecte l’avatar d’une entité" },
    sudo: { usage: `${prefix}sudo <@>`, desc: "👑 Accorde un pouvoir privilégié à une âme" },
    delsudo: { usage: `${prefix}delsudo <@>`, desc: "❌ Révoque un accès aux forces occultes" },
    repo: { usage: `${prefix}repo`, desc: "📂 Lien vers le grimoire du code" },
    dev: { usage: `${prefix}dev`, desc: "🛡️ Révèle l’identité du Maître des ténèbres" },
    owner: { usage: `${prefix}owner`, desc: "👑 Dévoile le gardien de ce spectre" }
  },

  settings: {
    public: { usage: `${prefix}public`, desc: "🌐 Active le mode ouverture du sanctuaire" },
    setprefix: { usage: `${prefix}setprefix <préfixe>`, desc: "🔧 Redéfinit la clé de commande des ombres" },
    autotype: { usage: `${prefix}autotype`, desc: "⌨️ Simule la frappe des esprits" },
    autorecord: { usage: `${prefix}autorecord`, desc: "🎙️ Capture automatiquement les murmures" },
    welcome: { usage: `${prefix}welcome`, desc: "👋 Initie le rituel de bienvenue des âmes" }
  },

  media: {
    photo: { usage: `${prefix}photo`, desc: "📸 Convertit un flux en image spectrale" },
    toaudio: { usage: `${prefix}toaudio`, desc: "🎵 Transforme la vidéo en onde des ténèbres" },
    sticker: { usage: `${prefix}sticker`, desc: "💠 Forge un talisman sticker depuis le média" },
    play: { usage: `${prefix}play <titre>`, desc: "🎶 Invoque un morceau depuis le néant" },
    img: { usage: `${prefix}img <texte>`, desc: "🖼️ Génère une image depuis les runes du texte" },
    vv: { usage: `${prefix}vv`, desc: "👁️ Télécharge un flux éphémère du spectre" },
    save: { usage: `${prefix}save`, desc: "💾 Capture et sécurise un artefact" },
    tiktok: { usage: `${prefix}tiktok <lien>`, desc: "🎬 Extrait le flux TikTok du néant" },
    url: { usage: `${prefix}url <texte>`, desc: "🔗 Dévoile le lien direct d’un artefact" }
  },

  group: {
    tag: { usage: `${prefix}tag`, desc: "📣 Alarme tous les âmes présentes" },
    tagall: { usage: `${prefix}tagall`, desc: "📢 Invoque chaque membre et gardien" },
    tagadmin: { usage: `${prefix}tagadmin`, desc: "🛡️ Cible uniquement les gardiens du sanctuaire" },
    kick: { usage: `${prefix}kick @utilisateur`, desc: "❌ Expulse une entité indésirable" },
    kickall: { usage: `${prefix}kickall`, desc: "⚡ Purge toutes les âmes non élues" },
    kickall2: { usage: `${prefix}kickall2`, desc: "⚡ Variante de purge totale" },
    promote: { usage: `${prefix}promote @utilisateur`, desc: "👑 Élévation au rang de gardien du sanctuaire" },
    demote: { usage: `${prefix}demote @utilisateur`, desc: "⬇️ Révocation du rang de gardien" },
    promoteall: { usage: `${prefix}promoteall`, desc: "👑 Tous les membres deviennent gardiens" },
    demoteall: { usage: `${prefix}demoteall`, desc: "⬇️ Tous les gardiens perdent leur rang" },
    mute: { usage: `${prefix}mute @utilisateur`, desc: "🔇 Scelle la voix d’une entité" },
    unmute: { usage: `${prefix}unmute @utilisateur`, desc: "🔊 Déverrouille la voix d’un membre" },
    gclink: { usage: `${prefix}gclink`, desc: "🔗 Dévoile le portail du sanctuaire" },
    antilink: { usage: `${prefix}antilink`, desc: "🚫 Neutralise les liens maudits automatiquement" },
    approveall: { usage: `${prefix}approveall`, desc: "✅ Accorde l’accès à toutes les âmes candidates" },
    bye: { usage: `${prefix}bye`, desc: "👋 Quitte le sanctuaire dans l’ombre" },
    join: { usage: `${prefix}join <lien>`, desc: "🔗 Infiltration dans le sanctuaire via lien" },
    add: { usage: `${prefix}add @utilisateur`, desc: "➕ Intègre une âme dans l’ordre" }
  },

  moderation: {
    block: { usage: `${prefix}block @utilisateur`, desc: "🚫 Bannissement immédiat dans l’ombre" },
    unblock: { usage: `${prefix}unblock @utilisateur`, desc: "✅ Réintègre une entité bannie" }
  },

  bug: {
    fuck: { usage: `${prefix}fuck`, desc: "🐞 Test ou rapport d’anomalie spectrale" }
  },

  creator: {
    addprem: { usage: `${prefix}addprem @utilisateur`, desc: "💎 Accorde le privilège élite" },
    delprem: { usage: `${prefix}delprem @utilisateur`, desc: "❌ Révoque le statut élite" }
  },

  premium: {
    ghostscan: { usage: `${prefix}ghostscan`, desc: "🌑 Analyse des ombres (réservé aux Premium)" },
    "auto-promote": { usage: `${prefix}auto-promote`, desc: "⚡ Promotion automatique (Premium)" },
    "auto-demote": { usage: `${prefix}auto-demote`, desc: "⬇️ Rétrogradation automatique (Premium)" },
    "auto-left": { usage: `${prefix}auto-left`, desc: "🚪 Quitte automatiquement un groupe (Premium)" }
  }
};

export default commandsInfo;