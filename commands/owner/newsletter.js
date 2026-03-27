/**
 * WhatsApp Channel Info - AGM Newsletter Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE DESIGN AGM (NEWSLETTER STYLE) ---
const AGM_NL = (name, subs, id) => `╭╼━≪• ᴀɢᴍ ɴᴇᴡsʟᴇᴛᴛᴇʀ •≫━╾╮
┃ ɴᴀᴍᴇ : ${name} 📢
┃ sᴜʙs : ${subs.toLocaleString()} 👥
┃ ɪᴅ : ${id} 🆔
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

// --- EXTRACTION DU CODE D'INVITATION ---
function getChannelInviteCode(link) {
  const patterns = [
    /whatsapp\.com\/channel\/([A-Za-z0-9]+)/i,
    /wa\.me\/channel\/([A-Za-z0-9]+)/i,
    /([A-Za-z0-9]{10,})/ // Code direct
  ];
  for (const p of patterns) {
    const match = link.match(p);
    if (match) return match[1];
  }
  return null;
}

module.exports = {
  name: 'newsletter',
  aliases: ['nl'],
  category: 'owner',
  description: 'Obtenir les infos d\'un canal WhatsApp',
  usage: '.nl <lien>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      
      // --- TON CANAL PAR DÉFAUT SI AUCUN ARGUMENT ---
      // Remplace '0029VaAbCdEfGhIJkL' par TON vrai code d'invitation si besoin
      const defaultChannel = "0029VaAbCdEfGhIJkL"; 
      let input = args.join(' ') || defaultChannel;

      const inviteCode = getChannelInviteCode(input);
      
      if (!inviteCode) {
        return extra.reply('❌ *ʟɪᴇɴ ᴅᴇ ᴄᴀɴᴀʟ ɪɴᴠᴀʟɪᴅᴇ.*');
      }

      await sock.sendMessage(chatId, { react: { text: '🗞️', key: msg.key } });

      try {
        // Récupération des métadonnées via Baileys
        const meta = await sock.newsletterMetadata('invite', inviteCode);
        
        if (!meta) throw new Error('Not found');

        const caption = AGM_DESIGN_NL(meta);
        
        // Construction du texte détaillé
        let infoBody = AGM_NL(meta.name || 'Channel', meta.subscriberCount || 0, meta.id);
        if (meta.description) {
          infoBody += `\n\n📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :*\n${meta.description}`;
        }
        infoBody += `\n\n🔗 *ʟɪɴᴋ :* https://whatsapp.com/channel/${meta.invite || inviteCode}`;

        if (meta.preview || meta.image) {
          await sock.sendMessage(chatId, {
            image: { url: meta.preview || meta.image },
            caption: infoBody
          }, { quoted: msg });
        } else {
          await extra.reply(infoBody);
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

      } catch (err) {
        console.error(err);
        await extra.reply('❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ʀéᴄᴜᴘéʀᴇʀ ʟᴇs ɪɴғᴏs. ᴠéʀɪғɪᴇᴢ ʟᴇ ʟɪᴇɴ ᴏᴜ ᴠᴏᴛʀᴇ ᴠᴇʀsɪᴏɴ ᴅᴇ ʙᴀɪʟᴇʏs.*');
      }
      
    } catch (error) {
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ : ${error.message}*`);
    }
  }
};
