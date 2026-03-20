/**
 * GetPP Command - Extract User Profile Picture
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

const GETPP_DESIGN = (target) => `╭╼━≪• ɢʜᴏsᴛ sᴄᴀɴɴᴇʀ •≫━╾╮
┃ 👤 ᴄɪʙʟᴇ : @${target.split('@')[0]}
┃ 🔍 sᴛᴀᴛᴜs : ᴘᴘ ᴇxᴛʀᴀᴄᴛᴇᴅ
┃ ✨ ǫᴜᴀʟɪᴛʏ : ʜɪɢʜ ᴅᴇғ
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic', 'pdp'],
  category: 'essentials',
  description: 'Récupère la photo de profil d\'un utilisateur.',
  usage: '.getpp [@user | reply]',
  
  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      
      // Logique de ciblage (Priorité : Mention > Réponse > Soi-même)
      if (ctxInfo?.mentionedJid?.length > 0) {
        targetUser = ctxInfo.mentionedJid[0];
      } else if (ctxInfo?.participant) {
        targetUser = ctxInfo.participant;
      } else {
        targetUser = extra.sender;
      }

      // Petit effet de "chargement/scan"
      await sock.sendMessage(extra.from, { react: { text: "📸", key: msg.key } });

      try {
        // Récupération de l'URL de la photo de profil (HD)
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');
        
        if (!ppUrl) throw new Error('No PP found');

        // Téléchargement de l'image
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        // Envoi avec le design Ghost
        await sock.sendMessage(extra.from, { 
          image: buffer,
          caption: GETPP_DESIGN(targetUser),
          mentions: [targetUser],
          contextInfo: {
            externalAdReply: {
              title: "GHOST PROFILE SCANNER",
              body: "Fetching target data...",
              mediaType: 1,
              thumbnail: buffer,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: msg });

        // Réaction de succès
        await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });

      } catch (profileError) {
        // Gestion des erreurs (PP privée ou inexistante)
        await sock.sendMessage(extra.from, { react: { text: "❌", key: msg.key } });
        return extra.reply(`╭╼━≪• ɢʜᴏsᴛ ᴇʀʀᴏʀ •≫━╾╮\n┃ ᴘʜᴏᴛᴏ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ...\n┃ ʟ'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴀ ᴘᴇᴜᴛ-ᴇᴛʀᴇ\n┃ ᴜɴᴇ ᴘᴘ ᴘʀɪᴠᴇᴇ. 🔒\n╰━━━━━━━━━━━━━━━╯`);
      }
      
    } catch (error) {
      console.error('GetPP Error:', error);
      extra.reply('❌ Erreur lors de la récupération du profil.');
    }
  }
};
