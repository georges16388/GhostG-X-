/**
 * Leave Command - Le bot quitte le Sanctuaire
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');

module.exports = {
  name: 'leave',
  aliases: ['quitter', 'partir', 'sortir'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'Ordonne au bot de quitter le groupe actuel avec un message d\'adieu.',
  usage: '.leave',
  groupOnly: true,
  ownerOnly: true, // Sécurité : Seul le créateur/owner peut faire quitter le bot d'un groupe !
  
  async execute(sock, msg, args, extra) {
    try {
      // Message d'adieu stylisé
      const farewellMessage = 
        `╭╼━≪• *ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ᴅᴜ_sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
        `┃ *sᴛᴀᴛᴜᴛ* : ᴅᴇᴘᴀʀᴛ ɪᴍᴍɪɴᴇɴᴛ 🚪\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `*🔮 ʟ'ʜᴇᴜʀᴇ ᴇsᴛ ᴠᴇɴᴜᴇ.* \n` +
        `*ᴍᴇs sᴇʀᴠɪᴄᴇs ɴᴇ sᴏɴᴛ ᴘʟᴜs ʀᴇǫᴜɪs ᴇɴ ᴄᴇs ʟɪᴇᴜx. ᴊᴇ ʀᴇᴛᴏᴜʀɴᴇ ᴅᴀɴs ʟᴇs ᴏᴍʙʀᴇs...*\n\n` +
        `*ǫᴜᴇ ʟᴀ sᴀɢᴇssᴇ ɢᴜɪᴅᴇ ᴠᴏs ᴘᴀs.*\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // 1. Envoi du message d'adieu dans le groupe
      await sock.sendMessage(extra.from, { text: farewellMessage });
      
      // 2. Petite temporisation d'une seconde pour s'assurer que le message parte bien
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 3. Le bot quitte le groupe
      await sock.groupLeave(extra.from);
      
    } catch (error) {
      console.error('Leave command error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ǫᴜɪᴛᴛᴇʀ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
