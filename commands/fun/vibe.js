/**
 * Vibe Check - Analyse l'énergie du jour
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const VIBE_DESIGN = (target, score, bar, energy) => `╭╼━≪• *ɢʜᴏsᴛ ᴠɪʙᴇ ᴄʜᴇᴄᴋ* •≫━╾╮
┃ 
┃ 👤 ${toSmallCaps('ᴄɪʙʟᴇ')} : @${target.split('@')[0]}
┃ 
┃ ✨ ${toSmallCaps('ᴀᴜʀᴀ')} : ${score}%
┃ 📊 ${toSmallCaps('ᴊᴀᴜɢᴇ')} : [${bar}]
┃ 
┃ 🔮 ${toSmallCaps('ᴇɴᴇʀɢɪᴇ')} : ${toSmallCaps(energy)}
┃ ✅ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps('analyse terminee')}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'vibe',
  aliases: ['aura', 'mood', 'energy'],
  category: 'fun',
  description: "Analyse ton aura ou celle d'un ami aujourd'hui.",
  usage: '.vibe [@user]',

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = mentioned[0] || ctx.participant || extra.sender;

      // Génération d'un score basé sur la date (constant pour 24h)
      const dateStr = new Date().toISOString().slice(0, 10);
      const seed = (targetId + dateStr).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const score = Math.abs((seed * 17) % 101);

      // Barre de progression (⚡ pour l'énergie, 🌑 pour le vide)
      const progress = Math.round(score / 10);
      const bar = "⚡".repeat(progress) + "🌑".repeat(10 - progress);

      // Types d'énergies traduits et stylisés
      let energy = "";
      if (score < 15) energy = "energie critique (va dormir) 🛌";
      else if (score < 35) energy = "vibe un peu sombre... 🌑";
      else if (score < 55) energy = "aura neutre et calme 🧘";
      else if (score < 75) energy = "energie positive en hausse ✨";
      else if (score < 90) energy = "aura de pur prestige 💎";
      else energy = "divinite absolue 🙌🔥";

      // Effet visuel : Boule de cristal
      await sock.sendMessage(extra.from, { react: { text: "🔮", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: VIBE_DESIGN(targetId, score, bar, energy), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[vibe] ERROR:', error);
      const errTxt = toSmallCaps("impossible de lire ton aura actuelle");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
