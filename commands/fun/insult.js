/**
 * Prestige Insult - Des "insultes" de milliardaire
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const PRESTIGE_DESIGN = (text) => `╭╼━≪• *ɢʜᴏsᴛ ᴘʀᴇsᴛɪɢᴇ* •≫━╾╮
┃ *ᴍsɢ* : ${text}
┃ *ᴛʏᴘᴇ* : ʟᴜxᴜʀʏ ᴛʀᴏʟʟ 💎
┃ *sᴛᴀᴛᴜs* : ʜɪɢʜ ᴄʟᴀss ✨
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'insult',
  aliases: ['insultme', 'burn', 'prestige'],
  category: 'fun',
  description: 'Des insultes tellement classes qu\'elles ressemblent à des compliments.',
  usage: '.insult @user',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;
      
      if (mentioned.length) targetId = mentioned[0];
      else if (ctx.participant) targetId = ctx.participant;
      else targetId = extra.sender;

      const targetTag = `@${targetId.split('@')[0]}`;

      const luxuryInsults = [
        `${targetTag}, ta tête ressemble tellement à celle d'un milliardaire que les banques t'ouvrent leurs portes juste pour ton sourire ! 🏦`,
        `Franchement ${targetTag}, tu es tellement brillant que même le diamant se sent complexé à côté de toi. 💎`,
        `Ton aura est si riche, ${targetTag}, qu'on dirait que tu as été sculpté dans un lingot d'or pur. 🏗️`,
        `${targetTag}, tu as l'élégance d'un jet privé en plein vol. Même le ciel te demande la permission de passer ! ✈️`,
        `Ta prestance est tellement élevée, ${targetTag}, que quand tu entres dans une pièce, le PIB du pays augmente de 5% ! 📈`,
        `${targetTag}, ton intelligence est une telle mine d'or que Forbes cherche désespérément à t'interviewer. 📑`,
        `Même si tu ne fais rien, ${targetTag}, ton charisme dégage une odeur de succès et de billets neufs. 💵`,
        `${targetTag}, on dirait que Dieu t'a créé avec une option "Succès Illimité" activée par défaut. 👑`
      ];

      const line = luxuryInsults[Math.floor(Math.random() * luxuryInsults.length)];

      await sock.sendMessage(extra.from, { 
        text: PRESTIGE_DESIGN(line), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[insult] ERROR:', error);
      await extra.reply('❌ Impossible de charger ton prestige...');
    }
  }
};
