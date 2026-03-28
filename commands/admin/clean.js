/**
 * CLEAN COMMAND - AGM SYSTEM CORE
 * PURGE MESSAGES FROM CHAT OR SPECIFIC USER
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- DESIGN AGM PRESTIGE (GRAS) ---
const AGM_CLEAN = (count, target) => {
  const targetLabel = target ? '@' + target.split('@')[0] : toStyledCaps('ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs');
  return `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴄʟᴇᴀɴ')} •≫━╾╮*
*┃*
*┃* 🧹 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ɴᴇᴛᴛᴏʏᴀɢᴇ')}*
*┃* 👤 *${toStyledCaps('ᴄɪʙʟᴇ')}* : *${targetLabel}*
*┃* 📦 *${toStyledCaps('ǫᴜᴀɴᴛɪᴛᴇ')}* : *${count} ${toStyledCaps('ᴍsɢs')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear', 'del', 'suppr'],
  category: 'admin',
  description: 'Supprimer les messages du groupe (tous ou par utilisateur).',
  usage: '.clean <nombre>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const count = parseInt(args[0]);
      if (isNaN(count) || count < 1 || count > 100) {
        return reply(`❌ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍʙʀᴇ ᴠᴀʟɪᴅᴇ (1-100)')}*`);
      }

      // Récupération du store (vérifie bien ton chemin d'import)
      const store = global.store; 
      const quotedJid = msg.message?.extendedTextMessage?.contextInfo?.participant;

      if (!store || !store.messages[from]) {
        return reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴇɴʀᴇɢɪsᴛʀᴇ ᴅᴀɴs ʟᴇ sᴛᴏʀᴇ')}*`);
      }

      const allMsgs = store.messages[from].array(); // Utilisation de .array() si store Baileys
      let messagesToDelete = [];

      if (quotedJid) {
        // Mode : messages de l'utilisateur cité
        messagesToDelete = allMsgs.filter(m => (m.key.participant || m.key.remoteJid) === quotedJid).reverse().slice(0, count);
      } else {
        // Mode : derniers messages du chat
        messagesToDelete = allMsgs.reverse().slice(0, count);
      }

      if (messagesToDelete.length === 0) {
        return reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴛʀᴏᴜᴠᴇ')}*`);
      }

      await react('🧹');
      await reply(AGM_CLEAN(messagesToDelete.length, quotedJid));

      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          // Délai de sécurité pour éviter le bannissement
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          // On ignore les messages de plus de 24h (insupprimables par le bot)
        }
      }

    } catch (error) {
      console.error('[CLEAN ERROR]:', error);
      reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ɴᴇᴛᴛᴏʏᴀɢᴇ')}*`);
    }
  }
};
