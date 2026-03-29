/**
 * Delete Command - GhostG-X MD (Invisible Edition)
 * Role : Silence & Clean ⚡
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
  name: 'delete',
  aliases: ['del', 'dlt'],
  description: 'Supprime le message cité et la commande elle-même sans laisser de trace.',
  usage: '.dlt (répondre à un message)',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from }) {
    try {
      // 1. EXTRACTION UNIVERSELLE DU CONTEXTE (Fix pour Médias/Images/Textes)
      const messageContent = msg.message;
      const type = Object.keys(messageContent)[0]; // Détermine le type de message (imageMessage, videoMessage, etc.)
      const ctx = messageContent[type]?.contextInfo;

      // 2. Vérifier si l'utilisateur a bien répondu à un message
      if (!ctx?.stanzaId) return; 

      // 3. Préparation de la clé du message CIBLÉ
      const targetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        participant: ctx.participant // Indispensable en groupe
      };

      // 4. SUPPRESSION SYNCHRONE (On attend la fin de l'action)
      // Suppression du message CIBLÉ
      await sock.sendMessage(from, { delete: targetKey });

      // Suppression de ta COMMANDE (.dlt) pour un nettoyage total
      await sock.sendMessage(from, { delete: msg.key });

    } catch (error) {
      // Log discret pour le développeur, silence pour les utilisateurs
      console.error('❌ [ᴅᴇʟᴇᴛᴇ_ᴇʀʀᴏʀ] :', error.message);
    }
  }
};
