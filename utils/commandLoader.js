const fs = require('fs');
const path = require('path');

const loadCommands = () => {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.error('❌ [ERROR]: Commands directory not found');
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
          // Permet de mettre à jour les commandes sans redémarrer le bot totalement
          delete require.cache[require.resolve(fullPath)];
          const command = require(fullPath);
          
          if (command.name) {
            // Indispensable pour classer tes commandes dans ton futur menu !
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
          console.error(`❌ [LOAD ERROR] ${file}:`, error.message);
        }
      });
    }
  });
  
  return commands;
};

module.exports = { loadCommands };
