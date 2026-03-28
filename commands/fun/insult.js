/**
 * Prestige Insult - AGM Elite Edition
 * Luxury Trolls for high-class members
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps pour le style Prestige
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ',
        'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'û': 'ᴜ', 'ù': 'ᴜ', 'ç': 'ᴄ'
    };
    const capsText = text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

const PRESTIGE_DESIGN = (content) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ᴘʀᴇsᴛɪɢᴇ')} •≫━╾╮*
*┃*\n*┃* 💎 *${toBoldSmallCaps('ᴍsɢ')}* : ${content}\n*┃* 💰 *${toBoldSmallCaps('ᴛʏᴘᴇ')}* : *${toBoldSmallCaps('ʟᴜxᴜʀʏ ᴛʀᴏʟʟ')}* 💎\n*┃* ✨ *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : *${toBoldSmallCaps('ʜɪɢʜ ᴄʟᴀss')}* ✨\n*┃*\n*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

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

      await sock.sendMessage(extra.from, { react: { text: '💎', key: msg.key } });

      const targetTag = `@${targetId.split('@')[0]}`;

      const luxuryInsults = [
        `TA TÊTE RESSEMBLE TELLEMENT À CELLE D'UN MILLIARDAIRE QUE LES BANQUES T'OUVRENT LEURS PORTES JUSTE POUR TON SOURIRE ! 🏦`,
        `FRANCHEMENT, TU ES TELLEMENT BRILLANT QUE MÊME LE DIAMANT SE SENT COMPLEXÉ À CÔTÉ DE TOI. 💎`,
        `TON AURA EST SI RICHE QU'ON DIRAIT QUE TU AS ÉTÉ SCULPTÉ DANS UN LINGOT D'OR PUR. 🏗️`,
        `TU AS L'ÉLÉGANCE D'UN JET PRIVÉ EN PLEIN VOL. MÊME LE CIEL TE DEMANDE LA PERMISSION DE PASSER ! ✈️`,
        `TA PRESTANCE EST TELLEMENT ÉLEVÉE QUE QUAND TU ENTRES DANS UNE PIÈCE, LE PIB DU PAYS AUGMENTE DE 5% ! 📈`,
        `TON INTELLIGENCE EST UNE TELLE MINE D'OR QUE FORBES CHERCHE DÉSESPÉRÉMENT À T'INTERVIEWER. 📑`,
        `MÊME SI TU NE FAIS RIEN, TON CHARISME DÉGAGE UNE ODEUR DE SUCCÈS ET DE BILLETS NEUFS. 💵`,
        `ON DIRAIT QUE DIEU T'A CRÉÉ AVEC UNE OPTION "SUCCÈS ILLIMITÉ" ACTIVÉE PAR DÉFAUT. 👑`
      ];

      const rawLine = luxuryInsults[Math.floor(Math.random() * luxuryInsults.length)];
      const styledLine = `${targetTag} : ${toBoldSmallCaps(rawLine)}`;

      await sock.sendMessage(extra.from, { 
        text: PRESTIGE_DESIGN(styledLine), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[insult] ERROR:', error);
      const errTxt = toBoldSmallCaps("Impossible de charger ton prestige...");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
