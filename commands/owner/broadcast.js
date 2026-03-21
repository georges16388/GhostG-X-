/**
 * Broadcast System - AGM Global Announcement
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (BROADCAST STYLE) ---
const AGM_BC = (message) => `╭╼━≪• ᴀɢᴍ ʙʀᴏᴀᴅᴄᴀsᴛ •≫━╾╮
┃ ᴛʏᴘᴇ : ɢʟᴏʙᴀʟ ᴀɴɴᴏᴜɴᴄᴇ 📢
┃ ᴀᴜᴛʜᴏʀ : ᴏᴡɴᴇʀ 👑
┃ ᴍᴇssᴀɢᴇ : ${message}
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Diffuser un message à tous les groupes',
  usage: '.bc <message>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      if (!text) return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴇssᴀɢᴇ à ᴅɪғғᴜsᴇʀ.*');

      await sock.sendMessage(extra.from, { react: { text: '📡', key: msg.key } });

      const chats = await sock.groupFetchAllParticipating();
      const groups = Object.values(chats);
      
      let success = 0;
      let failed = 0;

      // Message d'attente
      await extra.reply(`🚀 *ᴅɪғғᴜsɪᴏɴ ᴇɴ ᴄᴏᴜʀs sᴜʀ ${groups.length} ɢʀᴏᴜᴘᴇs...*`);

      for (const group of groups) {
        try {
          await sock.sendMessage(group.id, {
            text: AGM_BC(text)
          });
          success++;
          
          // Petit délai de 1.5s entre chaque groupe pour la sécurité du numéro
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (e) {
          failed++;
        }
      }

      // Rapport final AGM
      const report = `╭╼━≪• ʙᴄ ʀᴇᴘᴏʀᴛ •≫━╾╮\n` +
                     `┃ ✅ sᴜᴄᴄᴇss : ${success}\n` +
                     `┃ ❌ ғᴀɪʟᴇᴅ : ${failed}\n` +
                     `╰━━━━━━━━━━━━━━━╯`;
      
      await extra.reply(report);

    } catch (error) {
      console.error('BC Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ${error.message}*`);
    }
  }
};
