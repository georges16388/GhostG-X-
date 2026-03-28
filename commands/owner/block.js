/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - User Blocking System (AGM Security Edition)
 * Role : Restreindre l'accès global à un utilisateur
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_BLOCK_DESIGN = (user) => `*╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ʙʟᴏᴄᴋ •≫━╾╮*
*┃*
*┃* 👤 *${toSmallCaps('ᴛᴀʀɢᴇᴛ')}* : @${user.split('@')[0]}
*┃* 🚫 *${toSmallCaps('sᴛᴀᴛᴜs')}* : ʀᴇsᴛʀɪᴄᴛᴇᴅ
*┃* 🌐 *${toSmallCaps('sᴄᴏᴘᴇ')}* : ɢʟᴏʙᴀʟ ʙᴀɴ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'block',
  aliases: ['bloquer'],
  category: 'owner',
  description: 'Bloquer un utilisateur sur WhatsApp.',
  usage: '.block @user (ou répondre)',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const config = global.config || require('../../config');
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      let target;

      // 1. DÉTECTION INTELLIGENTE
      if (ctx?.mentionedJid?.[0]) {
        target = ctx.mentionedJid[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else if (args[0]) {
        const cleanNum = args[0].replace(/[^0-9]/g, '');
        if (cleanNum.length > 8) target = cleanNum + '@s.whatsapp.net';
      }

      if (!target) {
        return reply(`⚠️ *${toSmallCaps("veuillez mentionner ou répondre a un utilisateur")}*`);
      }

      // 2. SÉCURITÉ ANTI-AUTO-BLOCAGE
      const botId = sock.user.id.split(':')[0];
      const ownerNumber = config.ownerNumber || ""; // Assure-toi d'avoir ownerNumber dans ton config.js

      if (target.includes(botId)) {
        return reply(`❌ *${toSmallCaps("erreur : tu ne peux pas bloquer le bot")}*`);
      }
      
      if (target.includes(ownerNumber) || target.includes(msg.key.remoteJid.split('@')[0])) {
        return reply(`❌ *${toSmallCaps("sécurité : tu ne peux pas te bloquer toi-même")}*`);
      }

      await react('🚫');

      // 3. EXÉCUTION
      await sock.updateBlockStatus(target, 'block');

      // 4. CONFIRMATION
      await react('✅');
      return sock.sendMessage(from, {
        text: AGM_BLOCK_DESIGN(target),
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[BLOCK ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur")}* : ${error.message}`);
    }
  }
};
