/**
 * Support Command - AGM HQ
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const AGM_SUPPORT = () => `╭╼━≪• *ɢʜᴏsᴛɢ 𝐗 ꜱᴜᴘᴘᴏʀᴛ* •≫━╾╮
┃ 👤 *ᴏᴡɴᴇʀ* : ɢʜᴏꜱᴛɢ x
┃ 🌐 *ɢʀᴏᴜᴘ* : ʜǫ ᴄᴏᴍᴍᴜɴɪᴛʏ
┃ *ꜱᴛᴀᴛᴜꜱ* : 🟢 ᴏɴʟɪɴᴇ
╰━━━━━━━━━━━━━━━╯

*ʀᴇᴊᴏɪɢɴᴇᴢ ɴᴏᴛʀᴇ ᴄᴏᴍᴍᴜɴᴀᴜᴛᴇ́ :*
https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t

*_ʙᴇꜱᴏɪɴ ᴅ'ᴀɪᴅᴇ ᴏᴜ ᴅᴇ ɴᴏᴜᴠᴇᴀᴜx ᴇꜰꜰᴇᴛꜱ ? ᴏɴ ᴠᴏᴜꜱ ᴀᴛᴛᴇɴᴅ !_*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'support',
  aliases: ['group', 'aide'],
  category: 'essentials',
  description: 'Affiche le lien du groupe de support officiel',
  usage: '.support',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      
      // Réaction d'accueil
      await sock.sendMessage(chatId, { react: { text: '🫂', key: msg.key } });

      // Envoi du message avec typographie SmallCaps et l'image 2fmwpu.jpg
      await sock.sendMessage(chatId, {
        text: AGM_SUPPORT(),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏꜱᴛɢ-x ᴏꜰꜰɪᴄɪᴀʟ ʜǫ",
            body: "ᴄʟɪǫᴜᴇᴢ ᴘᴏᴜʀ ʀᴇᴊᴏɪɴᴅʀᴇ ʟᴀ ᴄᴏᴍᴍᴜɴᴀᴜᴛᴇ́",
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            sourceUrl: "https://chat.whatsapp.com/BEYGvU5LnR13lVBpU9ypgK",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Error in support command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ꜱᴜᴘᴘᴏʀᴛ :* ${error.message}`);
    }
  }
};
