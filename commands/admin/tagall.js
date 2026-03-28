/**
 * Tag All Command - AGM Elite Edition
 * Mention all group members with list
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
  name: 'tagall',
  aliases: ['mentionall', 'everyone', 'all'],
  category: 'admin',
  description: 'Taguer tous les membres du groupe avec une liste visible.',
  usage: '.tagall <message>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata }) {
    try {
      // 1. Récupération des membres
      const participants = groupMetadata?.participants || [];
      const mentions = participants.map(p => p.id);
      const messageText = args.join(' ') || 'ᴀᴛᴛᴇɴᴛɪᴏɴ ᴛᴏᴜᴛ ʟᴇ ᴍᴏɴᴅᴇ !';

      await react('📢');

      // 2. Construction du Design Prestige
      let text = `*╭╼━≪• ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ •≫━╾╮*
*┃*
*┃* 📝 *ᴍsɢ* : *${messageText}*
*┃* 👥 *ᴛᴏᴛᴀʟ* : *${participants.length} ᴍᴇᴍʙᴇʀs*
*┃*
*╰━━━━━━━━━━━━━━━╯*

`;

      // 3. Liste des membres avec numérotation
      participants.forEach((mem, index) => {
        text += `*${index + 1}.* @${mem.id.split('@')[0]}\n`;
      });

      text += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // 4. Envoi groupé avec mentions réelles
      await sock.sendMessage(from, { 
        text: text, 
        mentions: mentions 
      }, { quoted: msg });

    } catch (error) {
      console.error('TagAll Error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴜ ᴍᴀss-ᴛᴀɢ*`);
    }
  }
};
