/**
 * Leave Command - Le bot quitte le Sanctuaire
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'leave',
  aliases: ['quitter', 'partir', 'sortir'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  groupOnly: true,
  ownerOnly: true, // Sécurité : Seul le créateur/owner peut faire quitter le bot d'un groupe !
  description: `『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛᴇ ғᴀɪᴛ ǫᴜɪᴛᴛᴇʀ ʟᴇ ɢʀᴏᴜᴘᴇ ᴀᴠᴇᴄ ᴜɴ ᴍᴇssᴀɢᴇ ᴅ'ᴀᴅɪᴇᴜ`,
  usage: `${prefix}leave`,

  async execute(sock, msg, args, extra) {
    const { from, reply, isOwner } = extra;

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ sᴄᴇʟʟᴇʀ ʟᴇ ᴅᴇ́ᴘᴀʀᴛ.*');

    try {
      // Message d'adieu stylisé
      const farewellMessage = 
        `╭╼━≪• *ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ᴅᴜ_sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
        `┃ *sᴛᴀᴛᴜᴛ* : ᴅᴇᴘᴀʀᴛ ɪᴍᴍɪɴᴇɴᴛ 🚪\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `*🔮 ʟ\'ʜᴇᴜʀᴇ ᴇsᴛ ᴠᴇɴᴜᴇ.* \n` +
        `*ᴍᴇs sᴇʀᴠɪᴄᴇs ɴᴇ sᴏɴᴛ ᴘʟᴜs ʀᴇǫᴜɪs ᴇɴ ᴄᴇs ʟɪᴇᴜx. ᴊᴇ ʀᴇᴛᴏᴜʀɴᴇ ᴅᴀɴs ʟᴇs ᴏᴍʙʀᴇs...*\n\n` +
        `*ǫᴜᴇ ʟᴀ sᴀɢᴇssᴇ ɢᴜɪᴅᴇ ᴠᴏs ᴘᴀs.*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      // 1. Envoi du message d'adieu dans le groupe
      await sock.sendMessage(from, { text: farewellMessage });

      // 2. Petite temporisation d'une seconde pour s'assurer que le message parte bien
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Le bot quitte le groupe
      await sock.groupLeave(from);

    } catch (error) {
      console.error('Leave command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ : ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ǫᴜɪᴛᴛᴇʀ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.* \n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
