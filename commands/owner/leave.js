/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Group Exit System (AGM Social Core)
 * Role : Quitter un groupe avec un message d'adieu
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_LEAVE_DESIGN = (status) => `*╭╼━≪• ᴀɢᴍ ɢʀᴏᴜᴘ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* 🚪 *${toSmallCaps('ᴀᴄᴛɪᴏɴ')}* : ʟᴇᴀᴠᴇ ɢʀᴏᴜᴘ
*┃* ✨ *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃* 👋 *${toSmallCaps('ғᴀʀᴇᴡᴇʟʟ')}* : sᴇɴᴛ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'leave',
  aliases: ['quitter', 'exit', 'bye'],
  category: 'owner',
  description: 'Quitter le groupe avec un message de courtoisie.',
  ownerOnly: true,
  groupOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      // 1. DÉFINITION DU MESSAGE D'ADIEU
      // On utilise soit le texte fourni par l'owner, soit un message par défaut
      const farewell = args.join(' ') || "ᴄᴇ ғᴜᴛ ᴜɴ ᴘʟᴀɪsɪʀ, ᴍᴀɪs ᴊᴇ ᴅᴏɪs ᴍ'ᴇɴ ᴀʟʟᴇʀ. ᴀ ʙɪᴇɴᴛôᴛ ! ❤️✝️";

      await react('👋');

      // 2. ENVOI DU MESSAGE DE DÉPART
      await sock.sendMessage(from, { 
        text: `*ɢʜᴏsᴛɢ-x ᴍᴅ ɪɴғᴏ :*\n\n${farewell}\n\n_“${toSmallCaps('ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ')}”_` 
      });

      // 3. CONFIRMATION À L'OWNER (VIA MP POUR PLUS DE SÉCURITÉ)
      const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      await sock.sendMessage(ownerJid, { text: AGM_LEAVE_DESIGN('🟢 ᴇxɪᴛ ᴄᴏᴍᴘʟᴇᴛᴇ') });

      // 4. PETIT DÉLAI ET SORTIE DU GROUPE
      setTimeout(async () => {
        await sock.groupLeave(from);
      }, 1500);

    } catch (error) {
      console.error('[LEAVE ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur")}* : ${error.message}`);
    }
  }
};
