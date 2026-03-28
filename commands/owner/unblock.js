/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - User Unblocking System (AGM Security Edition)
 * Role : Restaurer l'accès à un utilisateur
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_UNBLOCK_DESIGN = (user) => `*╭╼━≪• ᴀɢᴍ ᴜɴʙʟᴏᴄᴋ sʏsᴛᴇᴍ •≫━╾╮*
*┃*
*┃* 👤 *${toSmallCaps('ᴛᴀʀɢᴇᴛ')}* : @${user.split('@')[0]}
*┃* ✨ *${toSmallCaps('sᴛᴀᴛᴜs')}* : 🟢 ʀᴇsᴛᴏʀᴇᴅ
*┃* ✅ *${toSmallCaps('ᴀᴄᴄᴇss')}* : ɢʀᴀɴᴛᴇᴅ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'unblock',
  aliases: ['unban', 'debloquer'],
  category: 'owner',
  description: 'Débloquer un utilisateur sur WhatsApp.',
  usage: '.unblock @user (ou répondre)',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      let target;

      // 1. DÉTECTION INTELLIGENTE DE LA CIBLE
      if (ctx?.mentionedJid?.[0]) {
        target = ctx.mentionedJid[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else if (args[0]) {
        // Nettoyage du numéro pour éviter les caractères spéciaux
        const cleanNum = args[0].replace(/[^0-9]/g, '');
        if (cleanNum.length > 8) {
            target = cleanNum + '@s.whatsapp.net';
        }
      }

      if (!target) {
        return reply(`⚠️ *${toSmallCaps("veuillez mentionner ou répondre a un utilisateur")}*`);
      }

      await react('🔓');

      // 2. MISE À JOUR DU STATUT (WhatsApp API)
      await sock.updateBlockStatus(target, 'unblock');

      // 3. CONFIRMATION
      await react('✅');
      return sock.sendMessage(from, {
        text: AGM_UNBLOCK_DESIGN(target),
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[UNBLOCK ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur")}* : ${error.message}`);
    }
  }
};
