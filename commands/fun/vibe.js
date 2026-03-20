/**
 * Vibe Check - Analyse l'énergie du jour
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const VIBE_DESIGN = (target, score, bar, energy) => `╭╼━≪• ɢʜᴏsᴛ ᴠɪʙᴇ ᴄʜᴇᴄᴋ •≫━╾╮
┃ ᴄɪʙʟᴇ : @${target.split('@')[0]} 👤
┃ 
┃ ᴀᴜʀᴀ : ${score}%
┃ ᴊᴀᴜɢᴇ : [${bar}]
┃ 
┃ ᴇɴᴇʀɢɪᴇ : ${energy}
┃ sᴛᴀᴛᴜs : ᴀɴᴀʟʏsᴇ ᴛᴇʀᴍɪɴᴇᴇ ✅
┃ 
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'vibe',
  aliases: ['aura', 'mood', 'energy'],
  category: 'fun',
  description: 'Analyse ton aura ou celle d\'un ami aujourd\'hui.',
  usage: '.vibe [@user]',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = mentioned[0] || ctx.participant || extra.sender;

      // Génération d'un score basé sur la date pour que ça change chaque jour
      // mais reste le même toute la journée pour un utilisateur précis
      const dateStr = new Date().toISOString().slice(0, 10);
      const seed = (targetId + dateStr).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const score = Math.abs((seed * 13) % 101);

      // Barre de progression
      const progress = Math.round(score / 10);
      const bar = "⚡".repeat(progress) + "🌑".repeat(10 - progress);

      // Types d'énergies
      let energy = "";
      if (score < 15) energy = "Énergie critique (va dormir) 🛌";
      else if (score < 35) energy = "Vibe un peu sombre... 🌑";
      else if (score < 55) energy = "Aura neutre et calme 🧘";
      else if (score < 75) energy = "Énergie positive en hausse ✨";
      else if (score < 90) energy = "Aura de pur prestige 💎";
      else energy = "DIVINITÉ ABSOLUE 🙌🔥";

      // Effet visuel
      await sock.sendMessage(extra.from, { react: { text: "🔮", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: VIBE_DESIGN(targetId, score, bar, energy), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[vibe] ERROR:', error);
      await extra.reply('❌ Impossible de lire ton aura actuelle.');
    }
  }
};
