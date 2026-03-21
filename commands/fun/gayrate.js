/**
 * Gayrate Command - Mesure le niveau de "fabulousness"
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const GAY_DESIGN = (target, percent, verdict) => `╭╼━≪• ɢʜᴏsᴛ ɢᴀʏ-ᴛᴇsᴛ •≫━╾╮
┃ ᴄɪʙʟᴇ : @${target.split('@')[0]} 🎯
┃ sᴄᴏʀᴇ : ${percent}% 🌈
┃ ᴠᴇʀᴅɪᴄᴛ : ${verdict}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'gayrate',
  aliases: ['gay', 'gaytest'],
  category: 'fun',
  description: 'Calcule le pourcentage de gayitude (humour).',
  usage: '.gayrate @user',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;
      
      if (mentioned.length) targetId = mentioned[0];
      else if (ctx.participant) targetId = ctx.participant;
      else targetId = extra.sender;

      // Génération d'un pourcentage aléatoire
      const percent = Math.floor(Math.random() * 101);

      // Système de verdicts drôles selon le score
      let verdict = "";
      if (percent === 0) verdict = "Hétéro pur cristal 🗿";
      else if (percent < 25) verdict = "Un peu suspect mais ça passe 🤔";
      else if (percent < 50) verdict = "Le radar commence à biper 📡";
      else if (percent < 75) verdict = "Porte des chaussettes roses en cachette 🧦";
      else if (percent < 90) verdict = "Prêt pour la Gay Pride 🏳️‍🌈";
      else if (percent < 100) verdict = "Expert certifié en arc-en-ciel 💅";
      else verdict = "ROI/REINE DES PAILLETTES ✨👑";

      // Envoi du message avec le design
      await sock.sendMessage(extra.from, { 
        text: GAY_DESIGN(targetId, percent, verdict), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[gayrate] ERROR:', error);
      await extra.reply('❌ Erreur lors du scan du radar...');
    }
  }
};
