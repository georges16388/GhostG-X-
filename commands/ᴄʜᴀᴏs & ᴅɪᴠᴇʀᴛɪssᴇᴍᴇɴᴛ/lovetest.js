/**
 * Gayrate / Test Command - GhostG-X Edition
 * Évalue aléatoirement le pourcentage pour un utilisateur ciblé
 */

module.exports = {
  name: 'ᴊᴜɢᴇᴍᴇɴᴛ_ɢ',
  aliases: ['gayrate', 'jugement', 'jugement_g', 'test', 'lovetest'],
  category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'Affiche un pourcentage ludique et aléatoire pour une cible',
  usage: '.ᴊᴜɢᴇᴍᴇɴᴛ_ɢ [@user or reply to a message]',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;

      // Détection de la cible : mention ou réponse
      if (mentioned.length > 0) {
        targetId = mentioned[0];
      } else if (ctx.participant) {
        targetId = ctx.participant;
      } else {
        // Si personne n'est ciblé, on prend l'auteur du message
        targetId = msg.key.participant || msg.key.remoteJid;
      }

      const targetTag = `@${targetId.split('@')[0]}`;

      // Génération d'un pourcentage purement aléatoire entre 0 et 100
      const percent = Math.floor(Math.random() * 101);

      const messages = [
        `*🔮 sᴄᴇᴀᴜ ᴅᴇ ʟ'ᴀʟᴄʜɪᴍɪᴇ : ${targetTag} ᴇsᴛ ᴀ̀ ${percent}% ᴍᴀɢɪғɪǫᴜᴇ* 🌈`,
        `*💖 ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛᴇ́ ᴀᴠᴇᴄ ʟᴇs ᴀʀᴄᴀɴᴇs : ${percent}% ᴘᴏᴜʀ ${targetTag}* ✨`,
        `*☬ sᴄᴏʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ : ${targetTag} ᴇsᴛ ᴘᴜʀ ᴀ̀ ${percent}% ᴅᴇ sᴘʟᴇɴᴅᴇᴜʀ* 💎`
      ];

      // Sélection d'une phrase d'ambiance au hasard
      const out = messages[Math.floor(Math.random() * messages.length)];

      await sock.sendMessage(extra.from, { 
        text: out, 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[gayrate] ERROR:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
