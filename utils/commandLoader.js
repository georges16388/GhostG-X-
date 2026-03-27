const fs = require('fs');
const path = require('path');

const loadCommands = () => {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');

  if (!fs.existsSync(commandsPath)) {
    console.error('❌ Dossier /commands introuvable');
    return commands;
  }

  const categories = fs.readdirSync(commandsPath);

  categories.forEach(category => {
    const categoryPath = path.join(commandsPath, category);
    
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

      files.forEach(file => {
        const fullPath = path.join(categoryPath, file);
        try {
          // Nettoyage du cache pour le hot-reload
          delete require.cache[require.resolve(fullPath)];
          const command = require(fullPath);

          if (command.name) {
            // Ajout de la catégorie à l'objet commande pour le menu
            command.category = category; 
            commands.set(command.name, command);

            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                if (!commands.has(alias)) {
                  commands.set(alias, command);
                }
              });
            }
          }
        } catch (error) {
          console.error(`[LOADER ERROR] ${file}:`, error);
        }
      });
    }
  });

  console.log(`✨ [ɢʜᴏꜱᴛɢ-x] ${commands.size} commandes opérationnelles.`);
  return commands;
};

module.exports = { loadCommands };
