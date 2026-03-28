/**
 * Support Command - AGM HQ (Elite Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const AGM_SUPPORT = () => `*╭╼━≪• ɢʜᴏsᴛɢ 𝐗 ꜱᴜᴘᴘᴏʀᴛ •≫━╾╮*
*┃* 👤 *ᴏᴡɴᴇʀ* : *ɢʜᴏꜱᴛɢ x*
*┃* 🌐 *ɢʀᴏᴜᴘ* : *ᴄᴏᴍᴍᴜɴɪᴛʏ*
*┃* ✅ *ꜱᴛᴀᴛᴜꜱ* : 🟢 *ᴏɴʟɪɴᴇ*
*╰━━━━━━━━━━━━━━━╯*

*ʀᴇᴊᴏɪɢɴᴇᴢ ɴᴏᴛʀᴇ ᴄᴏᴍᴍᴜɴᴀᴜᴛᴇ́ :*
https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf

*_ʙᴇꜱᴏɪɴ ᴅ'ᴀɪᴅᴇ ᴏᴜ ᴅᴇ ɴᴏᴜᴠᴇᴀᴜx ᴇꜰꜰᴇᴛꜱ ? ᴏɴ ᴠᴏᴜꜱ ᴀᴛᴛᴇɴᴅ !_*

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

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

      // Envoi du message avec image large et sans lien bleu
      await sock.sendMessage(chatId, {
        text: AGM_SUPPORT(),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏꜱᴛɢ-x ᴏꜰꜰɪᴄɪᴀʟ ʜǫ",
            body: "ᴄᴏᴍᴍᴜɴᴀᴜᴛᴇ ᴅᴇs ᴅᴏᴍɪɴᴀɴᴛs",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            renderLargerThumbnail: true,
            showAdAttribution: false // Désactive l'étiquette et cache le lien
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Error in support command:', error);
    }
  }
};
