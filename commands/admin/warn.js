/**
 * Warn Command - AGM System Core
 * Manage user discipline with auto-kick
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');
const config = require('../../config');

// --- DESIGN AGM PRESTIGE (LABELS FIXES) ---
const AGM_WARN = (user, reason, count, max) => {
  const statusLabel = count >= max ? '🚫 ᴇxᴘᴜʟsɪᴏɴ' : '🟡 ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛ';
  const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
  };

  return `*╭╼━≪• ${toSmallCaps('ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴡᴀʀɴ')} •≫━╾╮*
*┃*
*┃* 👤 *${toSmallCaps('ᴜᴛɪʟɪsᴀᴛᴇᴜʀ')}* : *@${user.split('@')[0]}*
*┃* 📝 *${toSmallCaps('ʀᴀɪsᴏɴ')}* : *${toSmallCaps(reason)}*
*┃* ⚠️ *${toSmallCaps('ᴡᴀʀɴɪɴɢs')}* : *${count} / ${max}*
*┃* 🛡️ *${toSmallCaps('sᴛᴀᴛᴜs')}* : *${toSmallCaps(statusLabel)}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'warn',
  aliases: ['warning', 'avertir'],
  category: 'admin',
  description: 'Avertir un utilisateur. L\'expulse après la limite.',
  usage: '.warn @user <raison>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react, groupMetadata }) {
    try {
      // --- DÉTECTION DE LA CIBLE (MIEUX OPTIMISÉE) ---
      let target;
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
          target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
          target = msg.message.extendedTextMessage.contextInfo.participant;
      } else if (args[0] && args[0].includes('@')) {
          target = args[0].replace('@', '') + '@s.whatsapp.net';
      }

      if (!target) {
        return reply(`⚠️ *${toSmallCaps("Veuillez mentionner ou répondre à un utilisateur.")}*`);
      }

      // --- VÉRIFICATION ADMIN (CORRIGÉE) ---
      // On cherche le participant dans la liste fournie par groupMetadata
      const participant = groupMetadata.participants.find(p => p.id === target);
      const isTargetAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

      if (isTargetAdmin) {
        return reply(`❌ *${toSmallCaps("Impossible d'avertir un administrateur.")}*`);
      }

      // --- LOGIQUE DE WARN ---
      const reason = args.join(' ').replace(/@\d+/g, '').trim() || 'ᴀᴜᴄᴜɴᴇ ʀᴀɪsᴏɴ sᴘᴇᴄɪꜰɪᴇᴇ';
      const maxWarns = config.maxWarnings || 3;

      // Appel à ta fonction database (assure-toi qu'elle renvoie l'objet { count: x })
      const warnings = database.addWarning(from, target, reason);

      await react('⚠️');

      // --- ENVOI DU RAPPORT ---
      await sock.sendMessage(from, {
        text: AGM_WARN(target, reason, warnings.count, maxWarns),
        mentions: [target]
      }, { quoted: msg });

      // --- GESTION DE L'EXPULSION ---
      if (warnings.count >= maxWarns) {
          // Vérification si le bot est admin via les métadonnées fraîches
          const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
          const botParticipant = groupMetadata.participants.find(p => p.id === botId);
          const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

          if (isBotAdmin) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await sock.sendMessage(from, { 
              text: `🚫 *ʟɪᴍɪᴛᴇ ᴀᴛᴛᴇɪɴᴛᴇ ᴘᴏᴜʀ @${target.split('@')[0]}. ᴇxᴘᴜʟsɪᴏɴ ᴇɴ ᴄᴏᴜʀs...*`, 
              mentions: [target] 
            });
            
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            database.clearWarnings(from, target);
          } else {
            await reply(`⚠️ *${toSmallCaps("Limite atteinte, mais je ne suis pas admin pour expulser.")}*`);
          }
      }

    } catch (error) {
      console.error('[WARN ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ*`);
    }
  }
};

// Utilitaire local pour le texte
function toSmallCaps(text) {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
}
