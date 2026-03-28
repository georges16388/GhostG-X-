/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - User Profile Picture Controller (AGM System Core)
 * Role : Change l'image de profil de l'OWNER
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_PP_DESIGN = (status) => `*╭╼━≪• ᴀɢᴍ ᴜsᴇʀ ᴘᴘ •≫━╾╮*
*┃*
*┃* 🖼️ *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃* ✨ *${toSmallCaps('ᴜᴘᴅᴀᴛᴇ')}* : 🟢 sᴜᴄᴄᴇss
*┃* 👤 *${toSmallCaps('ᴛᴀʀɢᴇᴛ')}* : ᴏᴡɴᴇʀ ᴘʀᴏғɪʟᴇ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'setmypp',
  aliases: ['setppuser', 'setppme', 'mypp'],
  category: 'owner',
  description: 'Changer TA propre photo de profil via le bot.',
  usage: '.setmypp (répondre à une image)',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      // 1. Extraction du média cité
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      const imageMsg = quoted?.imageMessage || 
                       quoted?.viewOnceMessageV2?.message?.imageMessage || 
                       quoted?.viewOnceMessage?.message?.imageMessage;

      if (!imageMsg) {
        return reply(`⚠️ *${toSmallCaps("veuillez répondre a une image")}*`);
      }

      await react('📸');

      // 2. Téléchargement en Buffer
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 3. MISE À JOUR DE TA PHOTO DE PROFIL (OWNER)
      // On utilise sock.user.id qui correspond au compte sur lequel le bot tourne
      const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      await sock.updateProfilePicture(myJid, buffer);

      await react('✅');
      return reply(AGM_PP_DESIGN('ᴜᴘᴅᴀᴛᴇᴅ'));

    } catch (error) {
      console.error('[SETMYPP ERROR]:', error);
      reply(`❌ *${toSmallCaps("echec de la mise a jour")}* : ${error.message}`);
    }
  }
};
