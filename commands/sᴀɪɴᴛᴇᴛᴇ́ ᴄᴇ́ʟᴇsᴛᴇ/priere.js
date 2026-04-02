/**
 * Prier Command - GhostG-X Edition
 * Génère une prière unique et puissante basée sur des briques spirituelles.
 * Supporte : Les mentions, les réponses (reply) et l'auto-prière.
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'prier',
  aliases: ['priere', 'prière','interceder', 'oraison', 'ᴘʀɪᴇʀ', 'pr'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴘᴜɪssᴀɴᴛᴇ ᴘʀɪᴇ̀ʀᴇ ᴍʏsᴛɪǫᴜᴇ ᴅ\'ɪɴᴛᴇʀᴄᴇssɪᴏɴ**',
  usage: `${prefix}prier [@user ou en réponse à un message]`,

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;

      // --- DÉTECTION DE LA CIBLE (Priorités) ---

      // 1. Si l'utilisateur a mentionné quelqu'un (@user)
      if (mentioned.length > 0) {
        targetId = mentioned[0];
      } 
      // 2. S'il n'y a pas de mention mais que l'utilisateur a répondu (reply) à un message
      else if (ctx.participant) {
        targetId = ctx.participant;
      } 
      // 3. Si aucune mention et aucun reply, la cible est l'auteur du message lui-même
      else {
        targetId = msg.key.participant || msg.key.remoteJid;
      }

      const targetTag = `@${targetId.split('@')[0]}`;

      // --- BRIQUES DE LA FORGE MYSTIQUE ---
      const intros = [
        "Dans les profondeurs du Sanctuaire, nous invoquons le Père Céleste pour",
        "Par le sang versé et les mystères de la foi, Seigneur Tout-Puissant, j'apporte",
        "Devant le trône de gloire, dans le secret de l'esprit, Dieu de grâce, je Te présente",
        "Maître suprême du visible et de l'invisible, nous remettons"
      ];

      const actions = [
        "pour qu'Il entoure cette âme de Son impénétrable bouclier de feu",
        "afin qu'Il inonde son cœur d'une paix surnaturelle et profonde",
        "pour que soient brisées toutes les chaînes et ombres de l'ennemi autour de",
        "afin que s'ouvrent les écluses des cieux pour bénir mystiquement",
        "pour Lui accorder la force occulte de vaincre tous les obstacles dressés devant"
      ];

      const desirs = [
        "et que Sa lumière pure dissipe définitivement toutes ses ténèbres",
        "afin qu'elle marche victorieuse à travers les épreuves de ce monde",
        "et que Sa sagesse infinie guide chacun de ses pas dans l'inconnu",
        "car Il reste son rocher inébranlable et son ultime libérateur"
      ];

      const amens = [
        "Au nom surpuissant et sacré de Jésus. Amen.",
        "Que Sa volonté souveraine s'accomplisse dans le secret. Amen.",
        "Nous scellons cette sainte parole dans l'éternité. Amen.",
        "Que l'univers en soit témoin. Amen et Amen."
      ];

      // Piocher un élément au hasard dans chaque catégorie
      const rIntro = intros[Math.floor(Math.random() * intros.length)];
      const rAction = actions[Math.floor(Math.random() * actions.length)];
      const rDesir = desirs[Math.floor(Math.random() * desirs.length)];
      const rAmen = amens[Math.floor(Math.random() * amens.length)];

      // Construction de la prière unique
      const priereGeneree = `*${rIntro} ${targetTag} ${rAction} cette vie, ${rDesir}. ${rAmen}*`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: `╭╼━≪• *ᴏʀᴀɪsᴏɴ_sᴀɪɴᴛᴇ* •≫━╾╮\n` +
              `┃ *ғᴏᴄᴜs* : ${targetTag}\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `*Spiritual Connection Established...*\n\n` +
              `${priereGeneree}\n\n` +
              `*_ᴊᴇsᴜs ᴇsᴛ ᴍᴀɪᴛʀᴇ sᴜᴘʀᴇᴍᴇ ♛_*\n` +
              `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
        mentions: [targetId]
      }, { quoted: msg });

    } catch (error) {
      console.error('Prier Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*〆 ᴇ́ᴄʜᴇᴄ ᴅ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};