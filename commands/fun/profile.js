/**
 * Profile Command - Display User Prestige Card
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

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
      const status = extra.isOwner ? "👑 ᴄʀᴇᴀᴛᴇᴜʀ ɪɴғɪɴɪ" : "💎 ᴍᴇᴍʙʀᴇ ᴘʀᴇsᴛɪɢᴇ";
      
      // Simulation de stats (tu pourras lier ça à ta DB plus tard)
      const level = Math.floor(Math.random() * 50) + 1;
      const xp = Math.floor(Math.random() * 1000);
      const money = (Math.random() * 1000000).toLocaleString('fr-FR');

      const PROFILE_DESIGN = `╭╼━≪• ɢʜᴏsᴛ ɪᴅᴇɴᴛɪᴛʏ •≫━╾╮
┃ 
┃ 👤 ɴᴏᴍ : ${pushname}
┃ 🏷️ ᴛᴀɢ : @${sender.split('@')[0]}
┃ 🏆 ʀᴀɴɢ : ${status}
┃ 
┃ 📊 sᴛᴀᴛs ᴅᴇ ᴘᴜɪssᴀɴᴄᴇ :
┃ 📈 ɴɪᴠᴇᴀᴜ : ${level}
┃ ✨ ᴇxᴘᴇʀɪᴇɴᴄᴇ : ${xp} XP
┃ 💰 ғᴏʀᴛᴜɴᴇ : ${money} ɢ-ᴄᴏɪɴs
┃ 
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

      // Réaction de prestige
      await sock.sendMessage(extra.from, { react: { text: "💳", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: PROFILE_DESIGN,
        mentions: [sender],
        contextInfo: {
          externalAdReply: {
            title: `PROFIL OFFICIEL - ${pushname.toUpperCase()}`,
            body: "Ghost AI System Security",
            mediaType: 1,
            // Utilise la photo de profil de l'utilisateur si possible
            thumbnailUrl: "https://telegra.ph/file/b3138928493e78b55526f.jpg", 
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Profile Error:', error);
      await extra.reply('❌ Impossible de générer ton profil.');
    }
  }
};
