/**
 * Reload Command - Hot-reload any command across subfolders
 * GhostG-X Edition
 * SÉCURITÉ ABSOLUE : Seuls les Maîtres Suprêmes peuvent l'évoquer.
 */

const path = require('path');
const fs = require('fs');
const config = require('../../config.js');

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

// Fonction récursive pour chercher un fichier dans toute l'arborescence
function findFile(dir, fileName) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Si c'est un dossier, on plonge dedans
      const found = findFile(fullPath, fileName);
      if (found) return found;
    } else if (file === fileName) {
      // Si on trouve le fichier exact, on renvoie son chemin absolu
      return fullPath;
    }
  }
  return null;
}

module.exports = {
  name: 'reload',
  aliases: ['recoder', 'maj'],
  category: '♕ ᴏᴠᴇʀʟᴏʀᴅ ᴄᴏɴᴛʀᴏʟ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇᴄʜᴀʀɢᴇ ᴜɴᴇ ᴄᴏᴍᴍᴀɴᴅᴇ sᴀɴs ᴄᴏᴜᴘᴇʀ ʟᴇ ʙᴏᴛ',
  usage: '.reload <nom_de_la_commande>',
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ AUTHENTIFICATION MAÎTRE UNIQUEMENT (Alignée sur supremeOwners)
      const isMaster = config.supremeOwners && config.supremeOwners.includes(senderNumber);

      if (!isMaster) return; 

      if (!args[0]) {
        return reply(`*⚠️ ${toSmallCaps('veuillez specifier le nom de la commande a recharger')} !*`);
      }

      const commandName = args[0].toLowerCase();

      // On récupère la liste des commandes
      const commands = extra.commands || sock.commands; 

      const cmd = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

      if (!cmd) {
        return reply(`*❌ ${toSmallCaps('commande introuvable dans le lexique')} !*`);
      }

      // 🎯 INITIALISATION DU SCAN
      const commandsDir = path.join(__dirname, '..'); 
      const fileName = `${cmd.name}.js`;

      const filePath = findFile(commandsDir, fileName);

      if (!filePath) {
        return reply(`*❌ ${toSmallCaps('impossible de localiser le fichier')} ${fileName} ${toSmallCaps('dans l arborescence')} !*`);
      }

      try {
        // On purge le cache Node.js pour forcer la relecture du fichier
        delete require.cache[require.resolve(filePath)];

        // On importe le fichier tout neuf
        const newCommand = require(filePath);

        // On écrase l'ancienne commande en mémoire
        commands.set(newCommand.name, newCommand);

        return reply(`*⚡ ${toSmallCaps('la transmigration a reussi')} !*\n*L'arcane* \`${newCommand.name}\` *a été rechargé à chaud depuis son abysse.*`);

      } catch (err) {
        return reply(`*❌ ${toSmallCaps('echec du rechargement')} :*\n\`\`\`javascript\n${err.message}\n\`\`\``);
      }

    } catch (error) {
      console.error('Reload command error:', error);
    }
  }
};
