/**
 * CLEAN COMMAND - AGM SYSTEM CORE
 * PURGE MESSAGES FROM CHAT OR SPECIFIC USER
 * STYLE BY -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_CLEAN = (count, target) => {
  const targetLabel = target ? '@' + target.split('@')[0] : toStyledCaps('ᴛᴏᴜs ʟᴇs ᴍᴇssᴀɢᴇs');
  return `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ sʏsᴛᴇᴍ ᴄʟᴇᴀɴ')} •≫━╾╮*
*┃*
*┃* 🧹 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ɴᴇᴛᴛᴏʏᴀɢᴇ')}*
*┃* 👤 *${toStyledCaps('ᴄɪʙʟᴇ')}* : *${targetLabel}*
*┃* 📦 *${toStyledCaps('ǫᴜᴀɴᴛɪᴛᴇ')}* : *${count} ${toStyledCaps('ᴍsɢs')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear', 'suppr'],
  category: 'admin',
  description: 'Supprimer les messages du groupe.',
  usage: '.clean <nombre>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const count = parseInt(args[0]);
      if (isNaN(count) || count < 1 || count > 100) {
        return reply(`❌ *${toStyledCaps('veuillez entrer un nombre valide (1-100)')}*`);
      }

      // 🛡️ RÉCUPÉRATION DU STORE GLOBAL
      const store = global.store; 
      
      // On vérifie si le store existe et contient des messages pour ce groupe
      if (!store || !store.messages || !store.messages[from]) {
        return reply(`❌ *${toStyledCaps('le store est vide. envoyez quelques messages d\'abord.')}*`);
      }

      // Extraction propre des messages
      const allMsgs = store.messages[from].toJSON() || store.messages[from].array();
      const quotedJid = msg.message?.extendedTextMessage?.contextInfo?.participant;

      let messagesToDelete = [];

      if (quotedJid) {
        // Mode : Filtrer par utilisateur cité
        messagesToDelete = allMsgs
          .filter(m => (m.key.participant || m.key.remoteJid) === quotedJid)
          .slice(-count); // On prend les plus récents
      } else {
        // Mode : Derniers messages du groupe
        messagesToDelete = allMsgs.slice(-count);
      }

      // On retire le message de commande lui-même de la liste pour ne pas bugger
      messagesToDelete = messagesToDelete.filter(m => m.key.id !== msg.key.id);

      if (messagesToDelete.length === 0) {
        return reply(`❌ *${toStyledCaps('aucun message supprimable trouve')}*`);
      }

      await react('🧹');
      
      // Envoi du rapport de nettoyage
      await sock.sendMessage(from, { 
        text: AGM_CLEAN(messagesToDelete.length, quotedJid),
        mentions: quotedJid ? [quotedJid] : []
      }, { quoted: msg });

      // Boucle de suppression
      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          // Petit délai pour la stabilité
          await new Promise(res => setTimeout(res, 300));
        } catch (e) { /* Ignorer les erreurs (messages trop vieux) */ }
      }

    } catch (error) {
      console.error('[CLEAN ERROR]:', error);
      reply(`❌ *${toStyledCaps('erreur systeme lors du nettoyage')}*`);
    }
  }
};
