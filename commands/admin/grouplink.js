/**
 * Group Link Command - AGM Invite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
    name: 'grouplink',
    aliases: ['link', 'invite'],
    category: 'admin',
    description: 'Get group invite link',
    usage: '.grouplink',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,

    async execute(sock, msg, args, extra) {
      try {
        const code = await sock.groupInviteCode(extra.from);
        const link = `https://chat.whatsapp.com/${code}`;
        const groupName = extra.groupMetadata.subject;

        // --- DESIGN DU LIEN D'INVITATION AGM ---
        let text = `╭╼━≪• ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ •≫━╾╮\n`;
        text += `┃ ɢʀᴏᴜᴘ : ${groupName}\n`;
        text += `┃ ʟɪɴᴋ : ${link}\n`;
        text += `┃ ᴛʏᴘᴇ : ᴏғғɪᴄɪᴀʟ ✅\n`;
        text += `╰━━━━━━━━━━━━━━━╯\n
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗\n\n`;
        text += `⚠️ *Note:* ɴᴇ ᴘᴀʀᴛᴀɢᴇᴢ ᴘᴀs ᴄᴇ ʟɪᴇɴ ᴘᴜʙʟɪǫᴜᴇᴍᴇɴᴛ ᴘᴏᴜʀ éᴠɪᴛᴇʀ ʟᴇs ɪɴᴛʀᴜs !`;

        await extra.reply(text);
        await sock.sendMessage(extra.from, { react: { text: "🔗", key: msg.key } });

      } catch (error) {
        await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
      }
    }
  };
