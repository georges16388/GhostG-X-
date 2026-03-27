/**
 * Command Loader - GhostG-X MD Core
 * Évite les dépendances circulaires et gère le cache
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const loadCommands = () => {
  const commands = new Map();
  // Chemin absolu vers le dossier commands
  const commandsPath = path.resolve(__dirname, '..', 'commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.log('❌ [ɢʜᴏꜱᴛɢ-x] Dossier /commands introuvable');
    return commands;
  }
  
  let totalCmds = 0;
  const categories = fs.readdirSync(commandsPath);
  
  categories.forEach(category => {
    const categoryPath = path.join(commandsPath, category);
    
    // On ne scanne que les dossiers (catégories)
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
      
      files.forEach(file => {
        const fullPath = path.join(categoryPath, file);
        try {
          // --- HOT RELOAD : On vide le cache de Node pour recharger à neuf ---
          delete require.cache[require.resolve(fullPath)];
          const command = require(fullPath);
          
          if (command.name) {
            // On injecte la catégorie dynamiquement (utile pour le menu !)
            command.category = category; 
            
            commands.set(command.name, command);
            totalCmds++;

            // Enregistrement des alias
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                if (!commands.has(alias)) {
                  commands.set(alias, command);
                }
              });
            }
          }
        } catch (error) {
          console.error(`❌ [LOAD ERROR] ${file}:`, error.message);
        }
      });
    }
  });
  
  console.log(`✨ [ɢʜᴏꜱᴛɢ-x] ${totalCmds} commandes chargées avec succès.`);
  return commands;
};

module.exports = { loadCommands };
