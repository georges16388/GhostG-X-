// commandsInfo.js
const commandsInfo = {
  utils: {
    uptime: {
      usage: ".uptime",
      desc: "Affiche depuis combien de temps le bot fonctionne"
    },
    ping: {
      usage: ".ping",
      desc: "Vérifie si le bot est en ligne et affiche la latence"
    },
    fancy: {
      usage: ".fancy <texte>",
      desc: "Transforme le texte en style fancy/orné"
    },
    channelid: {
      usage: ".channelid",
      desc: "Affiche l'identifiant du canal ou groupe"
    },
    help: {
      usage: ".help [commande]",
      desc: "Montre la liste des commandes ou les détails d'une commande"
    }
  },

  owner: {
    menu: {
      usage: ".menu",
      desc: "Affiche le menu complet du bot"
    },
    setpp: {
      usage: ".setpp",
      desc: "Change ton image de profil"
    },
    getpp: {
      usage: ".getpp",
      desc: "Récupère l'image de profil actuelle d'un participant"
    },
    sudo: {
      usage: ".sudo <@>",
      desc: "Permettre à un membre d'utiliser ton -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ"
    },
    delsudo: {
      usage: ".delsudo <utilisateur>",
      desc: "Retire un utilisateur des privilèges sudo"
    },
    repo: {
      usage: ".repo",
      desc: "Affiche le lien vers le dépôt GitHub du bot"
    },
    dev: {
      usage: ".dev",
      desc: "Affiche le numéro du développeur du bot"
    },
    owner: {
      usage: ".owner",
      desc: "Affiche le numéro du propriétaire du bot"
    }
  },

  settings: {
    public: {
      usage: ".public",
      desc: "Active le mode public pour le bot"
    },
    setprefix: {
      usage: ".setprefix <préfixe>",
      desc: "Change le préfixe utilisé pour les commandes"
    },
    autotype: {
      usage: ".autotype",
      desc: "Active la frappe automatique lors de l'envoi des messages"
    },
    autorecord: {
      usage: ".autorecord",
      desc: "Active l'enregistrement automatique des messages vocaux"
    },
    welcome: {
      usage: ".welcome",
      desc: "Active ou désactive le message de bienvenue dans les groupes"
    }
  },

  media: {
    photo: {
      usage: ".photo",
      desc: "Transforme un média reçu en photo"
    },
    toaudio: {
      usage: ".toaudio",
      desc: "Convertit une vidéo ou un voice note en fichier audio"
    },
    sticker: {
      usage: ".sticker",
      desc: "Transforme une image ou vidéo en sticker"
    },
    play: {
      usage: ".play <titre>",
      desc: "Télécharge et joue une musique à partir du titre donné"
    },
    img: {
      usage: ".img <texte>",
      desc: "Rechercher une image à partir du texte donné"
    },
    vv: {
      usage: ".vv",
      desc: "Télécharge une image/ vidéo de type vue unique"
    },
    save: {
      usage: ".save",
      desc: "Enregistre un média"
    },
    tiktok: {
      usage: ".tiktok <lien>",
      desc: "Télécharge une vidéo TikTok depuis le lien fourni"
    },
    url: {
      usage: ".url <texte>",
      desc: "Récupère le lien direct d'un media"
    }
  },

  group: {
    tag: {
      usage: ".tag",
      desc: "Mentionne tous les membres du groupe"
    },
    tagall: {
      usage: ".tagall",
      desc: "Mentionne tous les membres y compris les admins"
    },
    tagadmin: {
      usage: ".tagadmin",
      desc: "Mentionne seulement les administrateurs du groupe"
    },
    kick: {
      usage: ".kick @utilisateur",
      desc: "Expulse un membre du groupe"
    },
    kickall: {
      usage: ".kickall",
      desc: "Expulse tous les membres non-admins du groupe"
    },
    kickall2: {
      usage: ".kickall2",
      desc: "Version alternative pour expulser tous les membres"
    },
    promote: {
      usage: ".promote @utilisateur",
      desc: "Donne le rôle admin à un membre"
    },
    demote: {
      usage: ".demote @utilisateur",
      desc: "Retire le rôle admin à un membre"
    },
    promoteall: {
      usage: ".promoteall",
      desc: "Donne le rôle admin à tous les membres"
    },
    demoteall: {
      usage: ".demoteall",
      desc: "Retire le rôle admin à tous les admins"
    },
    mute: {
      usage: ".mute @utilisateur",
      desc: "Empêche les membres non admins d'envoyer des messages dans le groupe"
    },
    unmute: {
      usage: ".unmute @utilisateur",
      desc: "Réactive la possibilité d'envoyer des messages pour les membres non admins"
    },
    gclink: {
      usage: ".gclink",
      desc: "Récupère le lien d'invitation du groupe"
    },
    antilink: {
      usage: ".antilink",
      desc: "Active la suppression automatique des liens dans le groupe"
    },
    approveall: {
      usage: ".approveall",
      desc: "Approuve tous les membres en attente d'accès"
    },
    bye: {
      usage: ".bye",
      desc: "Envoie un message d'au revoir lorsqu'un membre quitte le groupe"
    },
    join: {
      usage: ".join <lien>",
      desc: "Rejoindre  un groupe via un lien"
    },
    add: {
      usage: ".add @utilisateur",
      desc: "Ajoute un membre au groupe"
    }
  },

  moderation: {
    block: {
      usage: ".block @utilisateur",
      desc: "Bloque un utilisateur"
    },
    unblock: {
      usage: ".unblock @utilisateur",
      desc: "Débloque un utilisateur"
    }
  },

  bug: {
    fuck: {
      usage: ".fuck",
      desc: "Commande pour tester ou signaler un bug"
    }
  },

  creator: {
    addprem: {
      usage: ".addprem @utilisateur",
      desc: "Donne le statut premium à un utilisateur"
    },
    delprem: {
      usage: ".delprem @utilisateur",
      desc: "Retire le statut premium à un utilisateur"
    }
  },

  premium: {
    "auto-promote": {
      usage: ".auto-promote",
      desc: "Active la promotion automatique des membres"
    },
    "auto-demote": {
      usage: ".auto-demote",
      desc: "Active la rétrogradation automatique des admins"
    },
    "auto-left": {
      usage: ".auto-left",
      desc: "Quitter automatiquement un groupe"
    }
  }
};

export default commandsInfo;