/**
 * Profile Command - AGM Elite Edition
 * Carte d'identité Ghost avec Full Bold Small Caps
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps (Style Prestige Intégral)
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', 
        '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'à': 'ᴀ', 'ç': 'ᴄ'
    };
    const capsText = text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

module.exports = {
  name: 'profile',
  aliases: ['me', 'profil', 'rank'],
  category: 'fun',
  description: 'Affiche ta carte de prestige Ghost Identity.',
  usage: '.profile',

  async execute(sock, msg, args, extra) {
    try {
      const sender = extra.sender;
      const pushname = msg.pushName || "ɢʜᴏsᴛ ᴜsᴇʀ";
      const chatId = extra.from;

      // Réaction de prestige
      await sock.sendMessage(chatId, { react: { text: "💳", key: msg.key } });

      // Statuts stylisés
      const status = extra.isOwner ? "👑 ᴄʀᴇᴀᴛᴇᴜʀ ɪɴғɪɴɪ" : "💎 ᴍᴇᴍʙʀᴇ ᴘʀᴇsᴛɪɢᴇ";

      // Simulation de statistiques
      const level = Math.floor(Math.random() * 50) + 1;
      const xp = Math.floor(Math.random() * 1000);
      const money = (Math.random() * 1000000).toLocaleString('fr-FR');

      // Construction du design Elite
      const PROFILE_DESIGN = `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ɪᴅᴇɴᴛɪᴛʏ')} •≫━╾╮*
*┃* *┃* 👤 *${toBoldSmallCaps('ɴᴏᴍ')}* : ${toBoldSmallCaps(pushname)}
*┃* 🏷️ *${toBoldSmallCaps('ᴛᴀɢ')}* : @${sender.split('@')[0]}
*┃* 🏆 *${toBoldSmallCaps('ʀᴀɴɢ')}* : *${toBoldSmallCaps(status)}*
*┃* *┃* 📊 *${toBoldSmallCaps('sᴛᴀᴛs ᴅᴇ ᴘᴜɪssᴀɴᴄᴇ')}* :
*┃* 📈 *${toBoldSmallCaps('ɴɪᴠᴇᴀᴜ')}* : ${toBoldSmallCaps(level.toString())}
*┃* ✨ *${toBoldSmallCaps('ᴇxᴘᴇʀɪᴇɴᴄᴇ')}* : ${toBoldSmallCaps(xp.toString())} *ᴘᴛs*
*┃* 💰 *${toBoldSmallCaps('ғᴏʀᴛᴜɴᴇ')}* : ${toBoldSmallCaps(money)} *ɢ-ᴄᴏɪɴs*
*┃* *╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

      // Récupération de la photo de profil réelle
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(sender, 'image');
      } catch (e) {
        // Image de secours si l'utilisateur n'a pas de PP publique
        ppUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
      }

      await sock.sendMessage(chatId, { 
        text: PROFILE_DESIGN,
        mentions: [sender],
        contextInfo: {
          externalAdReply: {
            title: toBoldSmallCaps(`ᴘʀᴏғɪʟ ᴏғғɪᴄɪᴇʟ - ${pushname}`),
            body: toBoldSmallCaps("sʏsᴛᴇᴍ sᴇᴄᴜʀɪᴛʏ - ɢʜᴏsᴛ ɪᴅᴇɴᴛɪᴛʏ"),
            mediaType: 1,
            thumbnailUrl: ppUrl, 
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Profile Error:', error);
      const errTxt = toBoldSmallCaps("impossible de generer ton profil");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
