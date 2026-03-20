/**
 * Goodbye - Enable/disable goodbye messages with Custom Design
 */

const db = require('../../database');

// Ton design personnalisé intégré directement
const DEFAULT_DESIGN = `╭╼━≪• 𝙻𝙴𝙰𝚅𝙴 ᴍᴇᴍʙᴇʀ •≫━╾╮
┃ ɢᴏᴏᴅʙʏᴇ : @user 👋
┃ ᴍᴇᴍʙᴇʀ ᴄᴏᴜɴᴛ : #memberCount
┃ ᴛɪᴍᴇ : time ⏰
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff'],
  category: 'admin',
  desc: 'Activer/Désactiver les messages de départ',
  usage: 'goodbye on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      
      // Récupération des réglages actuels
      let groupSettings = db.getGroupSettings(groupId);

      // Si aucun message n'est défini en base de données, on utilise ton design par défaut
      const currentMessage = groupSettings.goodbyeMessage || DEFAULT_DESIGN;

      if (!action || !['on', 'off'].includes(action)) {
        const status = groupSettings.goodbye ? '✅ Activé' : '❌ Désactivé';
        
        return await sock.sendMessage(groupId, {
          text: `👋 *Configuration des Départs*\n\n` +
                `*Statut :* ${status}\n\n` +
                `*Aperçu du Design :*\n${currentMessage}\n\n` +
                `*Commandes :*\n` +
                `> .goodbye on (Pour activer)\n` +
                `> .goodbye off (Pour désactiver)\n` +
                `> .setgoodbye <texte> (Pour changer le design)`
        }, { quoted: msg });
      }
      
      const enable = action === 'on';
      
      // Mise à jour de la base de données
      // On en profite pour injecter le design s'il n'y en a pas encore
      db.updateGroupSettings(groupId, { 
        goodbye: enable,
        goodbyeMessage: currentMessage 
      });
      
      await sock.sendMessage(groupId, {
        text: `✅ Messages de départ ${enable ? 'activés avec votre design' : 'désactivés'} !`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Erreur : ${error.message}`
      }, { quoted: msg });
    }
  }
};
