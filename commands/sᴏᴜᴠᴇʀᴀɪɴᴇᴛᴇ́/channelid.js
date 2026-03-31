/**
 * Newsletter Command - GhostG-X Edition
 * Récupère les informations d'un canal WhatsApp à partir de son lien ou code
 */

/**
 * Extrait le code d'invitation d'un lien de canal WhatsApp
 * @param {string} link - Lien du canal
 * @returns {string|null} - Code d'invitation ou null
 */
function getChannelInviteCode(link) {
  try {
    let cleanLink = link.trim();
    cleanLink = cleanLink.split('?')[0].split('#')[0];
    
    try {
      const url = new URL(cleanLink);
      const parts = url.pathname.split('/').filter(Boolean);
      const code = parts[parts.length - 1];
      if (code && code.length > 0) {
        return code;
      }
    } catch (urlError) {
      // Échec de l'analyse URL directe
    }
    
    const patterns = [
      /(?:whatsapp\.com|wa\.me)\/channel\/([A-Za-z0-9]+)/i,
      /\/channel\/([A-Za-z0-9]+)/i,
      /channel\/([A-Za-z0-9]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleanLink.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    if (/^[A-Za-z0-9]+$/.test(cleanLink)) {
      return cleanLink;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting invite code:', error);
    return null;
  }
}

module.exports = {
  name: 'ɪɴғᴏs_ᴄᴀɴᴀʟ',
  aliases: ['infos_canal', 'newsletter', 'channel', 'nl', 'channelid'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴇxᴛʀᴀɪᴛ ʟᴇs ᴀʀᴄᴀɴᴇs ᴇᴛ ɪɴғᴏs ᴅ\'ᴜɴ ᴄᴀɴᴀʟ ᴡʜᴀᴛsᴀᴘᴘ',
  usage: '.ɪɴғᴏs_ᴄᴀɴᴀʟ <ʟɪᴇɴ ᴅᴜ ᴄᴀɴᴀʟ>',
  ownerOnly: true, // Reste accessible uniquement aux admins/owners du bot

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');
      
      if (!text || text.trim().length === 0) {
        return extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ʟɪᴇɴ ᴅᴇ ᴄᴀɴᴀʟ ᴡʜᴀᴛsᴀᴘᴘ !*\n\n*ᴇxᴇᴍᴘʟᴇ : .ɪɴғᴏs_ᴄᴀɴᴀʟ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c*');
      }
      
      let link = text.replace(/^\.(infos_canal|newsletter|nl|channel)\s+/i, '').trim() || args.join(' ').trim();
      
      if (!link || link.length === 0) {
        return extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ʟɪᴇɴ ᴅᴇ ᴄᴀɴᴀʟ ᴡʜᴀᴛsᴀᴘᴘ !*\n\n*ᴇxᴇᴍᴘʟᴇ : .ɪɴғᴏs_ᴄᴀɴᴀʟ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c*');
      }
      
      const inviteCode = getChannelInviteCode(link);
      
      if (!inviteCode) {
        return extra.reply('*〆 ɪᴍᴘᴏssɪʙʟᴇ ᴅ\'ᴇxᴛʀᴀɪʀᴇ ʟᴇ sᴄᴇᴀᴜ ᴅ\'ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴅᴇ ᴄᴇ ʟɪᴇɴ !*\n\n*ғᴏᴜʀɴɪs ᴜɴ ʟɪᴇɴ ᴠᴀʟɪᴅᴇ ᴏᴜ sᴏɴ ᴄᴏᴅᴇ ʙʀᴜᴛ : .ɪɴғᴏs_ᴄᴀɴᴀʟ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c*');
      }
      
      link = inviteCode;
      
      try {
        const meta = await sock.newsletterMetadata('invite', link);
        
        if (!meta) {
          throw new Error('Newsletter not found');
        }
        
        let infoText = `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ ᴄᴀɴᴀʟ •≫━━━╾╮*\n`;
        
        if (meta.name) {
          infoText += `*┃ 🏷️ ɴᴏᴍ : ${meta.name}*\n`;
        }
        
        if (meta.id) {
          infoText += `*┃ 🆔 ɪᴅ : ${meta.id}*\n`;
        }
        
        if (meta.description) {
          infoText += `*┃ 📝 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ : ${meta.description}*\n`;
        }
        
        if (meta.invite) {
          infoText += `*┃ 🔗 sᴄᴇᴀᴜ : \`${meta.invite}\`*\n`;
        }
        
        if (meta.subscriberCount !== undefined) {
          infoText += `*┃ 👥 ᴀʙᴏɴɴᴇ́s : ${meta.subscriberCount.toLocaleString()}*\n`;
        }
        
        if (meta.creationTime) {
          const date = new Date(meta.creationTime * 1000);
          infoText += `*┃ 📅 ᴄʀᴇ́ᴀᴛɪᴏɴ : ${date.toLocaleDateString('fr-FR')}*\n`;
        }
        
        infoText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        if (meta.image) {
          await sock.sendMessage(chatId, {
            image: { url: meta.image },
            caption: infoText
          }, { quoted: msg });
        } else {
          await sock.sendMessage(chatId, {
            text: infoText
          }, { quoted: msg });
        }
        
      } catch (error) {
        console.error('Newsletter command error:', error);
        
        if (error.message.includes('Invalid channel link')) {
          await extra.reply('*〆 sᴛʀᴜᴄᴛᴜʀᴇ ᴅᴇ ʟɪᴇɴ ɪɴᴠᴀʟɪᴅᴇ !*');
        } else if (error.message.includes('Newsletter not found')) {
          await extra.reply('*〆 ᴄᴀɴᴀʟ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ ᴅᴀɴs ʟᴇs ᴀʙʏsᴇs ᴅᴇ ᴡʜᴀᴛsᴀᴘᴘ.*');
        } else if (error.message.includes('newsletterMetadata')) {
          await extra.reply('*〆 ʟᴀ ғᴏɴᴄᴛɪᴏɴ ɴᴇᴡsʟᴇᴛᴛᴇʀ ɴ\'ᴇsᴛ ᴘᴀs ᴀᴄᴛɪᴠᴇ́ᴇ sᴜʀ ᴄᴇ ɴᴏʏᴀᴜ ʙᴀɪʟᴇʏs.*');
        } else {
          await extra.reply(`*〆 ᴇ́ᴄʜᴇᴄ ᴅ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ${error.message}*`);
        }
      }
      
    } catch (error) {
      console.error('Newsletter command error:', error);
      await extra.reply(`*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ s'ᴇsᴛ ᴘʀᴏᴅᴜɪᴛᴇ : ${error.message}*`);
    }
  }
};
