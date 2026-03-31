/**
 * Small Caps Command - GhostG-X Edition
 * Convertit un texte normal en petites capitales ésotériques
 */

module.exports = {
  name: 'sᴍᴀʟʟᴄᴀᴘs',
  aliases: ['scaps', 'police', 'style', 'smallcaps'],
  category: '♞  ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'ᴛʀᴀɴsғᴏʀᴍᴇ ᴜɴ ᴛᴇxᴛᴇ ᴇɴ ᴘᴇᴛɪᴛᴇs ᴄᴀᴘɪᴛᴀʟᴇs',
  usage: '.sᴍᴀʟʟᴄᴀᴘs <ᴛᴇxᴛᴇ> ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ',
  
  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      let textToConvert = '';

      // 1. Extraction du texte (Si réponse ou arguments)
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg) {
        textToConvert = quotedMsg.conversation || 
                        quotedMsg.extendedTextMessage?.text || 
                        quotedMsg.imageMessage?.caption ||
                        quotedMsg.videoMessage?.caption ||
                        '';
      } else {
        textToConvert = args.join(' ');
      }

      textToConvert = textToConvert.trim();

      // Validation
      if (!textToConvert) {
        return reply('*⚠️ ᴍᴜʀᴍᴜʀᴇ ᴜɴ ᴛᴇxᴛᴇ ᴀᴘʀᴇ̀s ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ !*');
      }

      // 2. Fonction de conversion magique
      const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
      
      const convertedText = textToConvert.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? smallCaps[index] : char;
      }).join('');

      // 3. Envoi du message converti
      await reply(`*🔮 ʀᴇ́sᴜʟᴛᴀᴛ ᴅᴇ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ :*\n\n${convertedText}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (error) {
      console.error('[smallcaps] ERROR:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
