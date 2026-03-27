/**
 * Clean Command - AGM Purge Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const AGM_DESIGN = (deleted, total) => `╭╼━≪• ᴘᴜʀɢᴇ sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴄᴏᴍᴘʟᴇᴛᴇᴅ
┃ ᴅᴇʟᴇᴛᴇᴅ : ${deleted} / ${total} 🗑️
┃ sᴄᴏᴘᴇ : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear', 'del'],
  category: 'admin',
  description: 'Supprime les messages du groupe ou d\'un utilisateur spécifique.',
  usage: '.clean <nombre> (ou répondre à un message)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      // 1. Détermination du nombre de messages
      let count = parseInt(args[0]) || 10; // Par défaut 10 si non précisé
      if (count > 100) count = 100; // Limite de sécurité

      // 2. Récupération du store (on suppose qu'il est accessible via global ou passé)
      // Si tu n'as pas de store, Baileys ne peut pas "deviner" les anciens messages.
      const store = global.store; 
      if (!store || !store.messages[from]) {
        return reply('⚠️ *Impossible d\'accéder à l\'historique des messages (Store manquant).*');
      }

      await react('🧹');

      // 3. Identification de la cible (Si c'est un reply)
      const quoted = msg.message?.extendedTextMessage?.contextInfo;
      const targetUser = quoted?.participant;

      // Récupération et tri des messages (du plus récent au plus ancien)
      let allMessages = store.messages[from].array || Object.values(store.messages[from]);
      let filteredMessages = allMessages
        .filter(m => m.key && !m.key.fromMe) // On évite de supprimer ses propres messages de log si besoin
        .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0));

      let toDelete = [];

      if (targetUser) {
        // Mode suppression ciblée
        toDelete = filteredMessages.filter(m => (m.key.participant || m.key.remoteJid) === targetUser).slice(0, count);
      } else {
        // Mode suppression globale
        toDelete = filteredMessages.slice(0, count);
      }

      if (toDelete.length === 0) return reply('⚠️ *Aucun message trouvé à supprimer.*');

      let deletedCount = 0;
      for (const m of toDelete) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          deletedCount++;
          // Petit délai pour éviter le spam block de WhatsApp
          await new Promise(res => setTimeout(res, 250));
        } catch (err) {
          // On continue même si un message échoue
        }
      }

      return reply(AGM_DESIGN(deletedCount, toDelete.length));

    } catch (e) {
      console.error('[CLEAN ERROR]:', e);
      reply('❌ *Erreur système lors de la purge.*');
    }
  }
};
