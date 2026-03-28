/**
 * Profile Command - Carte d'identité Ghost
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps pour l'esthétique Ghost
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

module.exports = {
  name: 'profile',
  aliases: ['me', 'profil', 'rank'],
  category: 'fun',
  description: 'Affiche ta carte de prestige Ghost.',
  usage: '.profile',

  async execute(sock, msg, args, extra) {
    try {
      const sender = extra.sender;
      const pushname = msg.pushName || "Ghost User";
      
      // Statuts stylisés
      const status = extra.isOwner ? "👑 ᴄʀᴇᴀᴛᴇᴜʀ ɪɴғɪɴɪ" : "💎 ᴍᴇᴍʙʀᴇ ᴘʀᴇsᴛɪɢᴇ";

      // Simulation de statistiques (Liaison DB possible ici)
      const level = Math.floor(Math.random() * 50) + 1;
      const xp = Math.floor(Math.random() * 1000);
      const money = (Math.random() * 1000000).toLocaleString('fr-FR');

      // Construction du design avec Small Caps
      const PROFILE_DESIGN = `╭╼━≪• *ɢʜᴏsᴛ ɪᴅᴇɴᴛɪᴛʏ* •≫━╾╮
┃ 
┃ 👤 ${toSmallCaps('ɴᴏᴍ')} : ${pushname}
┃ 🏷️ ${toSmallCaps('ᴛᴀɢ')} : @${sender.split('@')[0]}
┃ 🏆 ${toSmallCaps('ʀᴀɴɢ')} : ${status}
┃ 
┃ 📊 ${toSmallCaps('sᴛᴀᴛs ᴅᴇ ᴘᴜɪssᴀɴᴄᴇ')} :
┃ 📈 ${toSmallCaps('ɴɪᴠᴇᴀᴜ')} : ${level}
┃ ✨ ${toSmallCaps('ᴇxᴘᴇʀɪᴇɴᴄᴇ')} : ${xp} ᴘᴛs
┃ 💰 ${toSmallCaps('ғᴏʀᴛᴜɴᴇ')} : ${money} ɢ-ᴄᴏɪɴs
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // Réaction de prestige
      await sock.sendMessage(extra.from, { react: { text: "💳", key: msg.key } });

      // Tentative de récupération de la photo de profil (PP)
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(sender, 'image');
      } catch (e) {
        ppUrl = "https://telegra.ph/file/b3138928493e78b55526f.jpg"; // Image par défaut
      }

      await sock.sendMessage(extra.from, { 
        text: PROFILE_DESIGN,
        mentions: [sender],
        contextInfo: {
          externalAdReply: {
            title: `ᴘʀᴏғɪʟ ᴏғғɪᴄɪᴇʟ - ${pushname.toUpperCase()}`,
            body: toSmallCaps("system security - ghost identity"),
            mediaType: 1,
            thumbnailUrl: ppUrl, 
            sourceUrl: "https://whatsapp.com/channel/your-link", // Ton canal ici
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Profile Error:', error);
      const errTxt = toSmallCaps("impossible de generer ton profil");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
