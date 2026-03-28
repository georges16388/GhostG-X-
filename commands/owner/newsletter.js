/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - WhatsApp Channel Info (AGM Newsletter Edition)
 * Optimized for Baileys Multi-Device
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_NL_DESIGN = (name, subs, id) => `*╭╼━≪• ᴀɢᴍ ɴᴇᴡsʟᴇᴛᴛᴇʀ •≫━╾╮*
*┃*
*┃* 📢 *${toSmallCaps('ɴᴀᴍᴇ')}* : ${name}
*┃* 👥 *${toSmallCaps('sᴜʙs')}* : *${subs.toLocaleString()}*
*┃* 🆔 *${toSmallCaps('ɪᴅ')}* : \`${id}\`
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

function getChannelInviteCode(link) {
  const patterns = [
    /whatsapp\.com\/channel\/([A-Za-z0-9]+)/i,
    /([A-Za-z0-9]{10,})/ 
  ];
  for (const p of patterns) {
    const match = link.match(p);
    if (match) return match[1];
  }
  return null;
}

module.exports = {
  name: 'newsletter',
  aliases: ['nl', 'channelinfo'],
  category: 'owner',
  description: 'Obtenir les infos d\'un canal WhatsApp',
  usage: '.nl <lien>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;
    
    try {
      // Ton canal GhostG par défaut (Remplace par ton vrai code)
      const defaultChannel = "0029VagO6vH1dAvvHlSg4r39"; 
      let input = args[0] || defaultChannel;
      const inviteCode = getChannelInviteCode(input);

      if (!inviteCode) return reply(`❌ *${toSmallCaps("lien de canal invalide")}*`);

      await react('🗞️');

      try {
        // Récupération via Baileys (nécessite une version récente)
        const meta = await sock.newsletterMetadata('invite', inviteCode);
        if (!meta) throw new Error('Not found');

        let infoBody = AGM_NL_DESIGN(meta.name, meta.subscriberCount || 0, meta.id);
        
        if (meta.description) {
          infoBody += `\n\n📝 *${toSmallCaps('ᴅᴇsᴄʀɪᴘᴛɪᴏɴ')} :*\n${meta.description}`;
        }
        
        infoBody += `\n\n🔗 *${toSmallCaps('ʟɪɴᴋ')} :*\nhttps://whatsapp.com/channel/${inviteCode}`;

        // Gestion de l'image de profil du canal
        const image = meta.preview || meta.picture || meta.image;

        if (image) {
          await sock.sendMessage(from, {
            image: { url: image },
            caption: infoBody,
            contextInfo: {
                externalAdReply: {
                    title: `ɴᴇᴡsʟᴇᴛᴛᴇʀ: ${meta.name}`,
                    body: `ɢʜᴏsᴛɢ-x ᴍᴅ sʏsᴛᴇᴍ`,
                    thumbnailUrl: image,
                    mediaType: 1
                }
            }
          }, { quoted: msg });
        } else {
          await reply(infoBody);
        }

        await react('✅');

      } catch (err) {
        console.error(err);
        await reply(`❌ *${toSmallCaps("impossible de recuperer les infos")}*\n${toSmallCaps("verifiez le code ou la connexion")}`);
      }

    } catch (error) {
      await reply(`❌ *${toSmallCaps("erreur systeme")}* : ${error.message}`);
    }
  }
};
