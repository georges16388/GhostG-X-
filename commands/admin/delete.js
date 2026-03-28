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
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      // 1. Vérifier si l'utilisateur a bien répondu à un message
      if (!ctx?.stanzaId) return; 

      // 2. Préparation de la clé du message à supprimer (le média ou texte cité)
      const targetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        participant: ctx.participant || ctx.remoteJid // Gère groupes et DM
      };

      // 3. Suppression du message CIBLÉ
      await sock.sendMessage(from, { delete: targetKey });

      // 4. Suppression de ta COMMANDE (.dlt) pour un nettoyage total
      await sock.sendMessage(from, { delete: msg.key });

    } catch (error) {
      console.error('Delete command error:', error);
      // En cas d'erreur (message trop vieux), on ne répond rien pour rester discret
    }
  }
};
