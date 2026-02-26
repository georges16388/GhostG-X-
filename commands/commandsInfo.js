// commandsInfo.js
import configmanager from "../utils/configmanager.js";
const prefix = configmanager.get("PREFIX") || "."; // préfixe dynamique

const commandsInfo = {
  utils: {
    uptime: {
      usage: `${prefix}uptime`,
      desc: "⏱️ Mesure le temps de survie du système"
    },
    ping: {
      usage: `${prefix}ping`,
      desc: "⚡ Vérifie la réactivité du réseau"
    },
    fancy: {
      usage: `${prefix}fancy <texte>`,
      desc: "🎨 Code le texte en style cryptique"
    },
    channelid: {
      usage: `${prefix}channelid`,
      desc: "🔗 Expose l'ID du canal ou du groupe"
    },
    help: {
      usage: `${prefix}help [commande]`,
      desc: "📜 Liste les commandes et leur fonction"
    }
  },

  owner: {
    menu: {
      usage: `${prefix}menu`,
      desc: "🛠️ Affiche l'arsenal complet du bot"
    },
    setpp: {
      usage: `${prefix}setpp`,
      desc: "🖼️ Modifie l’avatar du bot"
    },
    getpp: {
      usage: `${prefix}getpp`,
      desc: "🔍 Inspecte l’avatar d’un utilisateur"
    },
    sudo: {
      usage: `${prefix}sudo <@>`,
      desc: "👑 Accorde un accès privilégié"
    },
    delsudo: {
      usage: `${prefix}delsudo <@>`,
      desc: "❌ Révoque l’accès privilégié"
    },
    repo: {
      usage: `${prefix}repo`,
      desc: "📂 Lien vers le noyau du code"
    },
    dev: {
      usage: `${prefix}dev`,
      desc: "🛡️ Identité du Maître 💀"
    },
    owner: {
      usage: `${prefix}owner`,
      desc: "👑 Révèle le gardien du bot"
    }
  },

  settings: {
    public: {
      usage: `${prefix}public`,
      desc: "🌐 Active le mode ouverture totale"
    },
    setprefix: {
      usage: `${prefix}setprefix <préfixe>`,
      desc: "🔧 Redéfinit la clé de commande"
    },
    autotype: {
      usage: `${prefix}autotype`,
      desc: "⌨️ Simule la frappe humaine"
    },
    autorecord: {
      usage: `${prefix}autorecord`,
      desc: "🎙️ Capture automatique des flux audio"
    },
    welcome: {
      usage: `${prefix}welcome`,
      desc: "👋 Initialise le rituel de bienvenue"
    }
  },

  media: {
    photo: {
      usage: `${prefix}photo`,
      desc: "📸 Convertit tout flux en image"
    },
    toaudio: {
      usage: `${prefix}toaudio`,
      desc: "🎵 Transforme la vidéo en onde sonore"
    },
    sticker: {
      usage: `${prefix}sticker`,
      desc: "💠 Forge un sticker à partir du média"
    },
    play: {
      usage: `${prefix}play <titre>`,
      desc: "🎶 Invoque un morceau depuis le réseau"
    },
    img: {
      usage: `${prefix}img <texte>`,
      desc: "🖼️ Génère une image depuis l’esprit du texte"
    },
    vv: {
      usage: `${prefix}vv`,
      desc: "👁️ Télécharge un flux éphémère"
    },
    save: {
      usage: `${prefix}save`,
      desc: "💾 Capture et sécurise un média"
    },
    tiktok: {
      usage: `${prefix}tiktok <lien>`,
      desc: "🎬 Extrait le flux TikTok demandé"
    },
    url: {
      usage: `${prefix}url <texte>`,
      desc: "🔗 Dévoile le lien direct d’un média"
    }
  },

  group: {
    tag: {
      usage: `${prefix}tag`,
      desc: "📣 Alarme tous les membres"
    },
    tagall: {
      usage: `${prefix}tagall`,
      desc: "📢 Invoque chaque membre + admin"
    },
    tagadmin: {
      usage: `${prefix}tagadmin`,
      desc: "🛡️ Cible uniquement les gardiens"
    },
    kick: {
      usage: `${prefix}kick @utilisateur`,
      desc: "❌ Expulse un intrus"
    },
    kickall: {
      usage: `${prefix}kickall`,
      desc: "⚡ Purge tous les non-élus"
    },
    kickall2: {
      usage: `${prefix}kickall2`,
      desc: "⚡ Variante de purge totale"
    },
    promote: {
      usage: `${prefix}promote @utilisateur`,
      desc: "👑 Élévation au rang de gardien"
    },
    demote: {
      usage: `${prefix}demote @utilisateur`,
      desc: "⬇️ Révocation du rang de gardien"
    },
    promoteall: {
      usage: `${prefix}promoteall`,
      desc: "👑 Tous les membres deviennent gardiens"
    },
    demoteall: {
      usage: `${prefix}demoteall`,
      desc: "⬇️ Tous les gardiens perdent leur rang"
    },
    mute: {
      usage: `${prefix}mute @utilisateur`,
      desc: "🔇 Scelle la voix d’un membre"
    },
    unmute: {
      usage: `${prefix}unmute @utilisateur`,
      desc: "🔊 Déverrouille la voix d’un membre"
    },
    gclink: {
      usage: `${prefix}gclink`,
      desc: "🔗 Dévoile le portail du groupe"
    },
    antilink: {
      usage: `${prefix}antilink`,
      desc: "🚫 Neutralise les liens automatiquement"
    },
    approveall: {
      usage: `${prefix}approveall`,
      desc: "✅ Accorde l’accès à tous les candidats"
    },
    bye: {
      usage: `${prefix}bye`,
      desc: "👋 Quitte le groupe dans l’ombre"
    },
    join: {
      usage: `${prefix}join <lien>`,
      desc: "🔗 Infiltration via lien"
    },
    add: {
      usage: `${prefix}add @utilisateur`,
      desc: "➕ Intègre un membre dans l’ordre"
    }
  },

  moderation: {
    block: {
      usage: `${prefix}block @utilisateur`,
      desc: "🚫 Bannissement immédiat"
    },
    unblock: {
      usage: `${prefix}unblock @utilisateur`,
      desc: "✅ Réintègre l’utilisateur"
    }
  },

  bug: {
    fuck: {
      usage: `${prefix}fuck`,
      desc: "🐞 Test ou rapport d’anomalie"
    }
  },

  creator: {
    addprem: {
      usage: `${prefix}addprem @utilisateur`,
      desc: "💎 Accorde le privilège premium"
    },
    delprem: {
      usage: `${prefix}delprem @utilisateur`,
      desc: "❌ Révoque le statut premium"
    }
  },

  premium: {
    "auto-promote": {
      usage: `${prefix}auto-promote`,
      desc: "⚡ Promotion silencieuse activée"
    },
    "auto-demote": {
      usage: `${prefix}auto-demote`,
      desc: "⬇️ Rétrogradation automatique activée"
    },
    "auto-left": {
      usage: `${prefix}auto-left`,
      desc: "🚪 Quitte un groupe de manière automatique"
    }
  }
};

export default commandsInfo;