/**
 * Command Loader - AGM Command-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

/**
 * Chargeur de commandes dynamique
 */
const loadCommands = () => {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.log('╭╼━≪• ᴀɢᴍ ꜱʏꜱᴛᴇᴍ •≫━╾╮\n┃ ᴇʀʀᴏʀ : ᴄᴏᴍᴍᴀɴᴅꜱ ɴᴏᴛ ꜰᴏᴜɴᴅ\n╰━━━━━━━━━━━━━━━╯');
    return commands;
  }
  
  const categories = fs.readdirSync(commandsPath);
  let totalLoaded = 0;

  categories.forEach(category => {
    const categoryPath = path.join(commandsPath, category);
    
    // On vérifie que c'est bien un dossier (catégorie)
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
      
      files.forEach(file => {
        try {
          // Suppression du cache pour permettre le rechargement à chaud
          const fullPath = path.join(categoryPath, file);
          delete require.cache[require.resolve(fullPath)];
          
          const command = require(fullPath);
          
          if (command.name) {
            // Enregistrement de la commande principale
            commands.set(command.name.toLowerCase(), command);
            totalLoaded++;

            // Enregistrement des alias
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                commands.set(alias.toLowerCase(), command);
              });
            }
          }
        } catch (error) {
          console.error(`❌ [ᴀɢᴍ_ʟᴏᴀᴅ_ꜰᴀɪʟ] : ${file} ->`, error.message);
        }
      });
    }
  });
  
  // Log de succès en Small Caps
  console.log(`╭╼━≪• ᴀɢᴍ ᴄᴏᴍᴍᴀɴᴅ ᴄᴏʀᴇ •≫━╾╮
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ᴀʟʟ ꜱʏꜱᴛᴇᴍꜱ ɢᴏ
┃ ʟᴏᴀᴅᴇᴅ : ${totalLoaded} ᴄᴏᴍᴍᴀɴᴅꜱ
╰━━━━━━━━━━━━━━━╯`);
  
  return commands;
};

module.exports = { loadCommands };
