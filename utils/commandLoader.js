/**
 * Command Loader - GhostG-X MD Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const loadCommands = () => {
  const commands = new Map();
  const commandsPath = path.resolve(__dirname, '..', 'commands');

  if (!fs.existsSync(commandsPath)) {
    console.log('❌ [ɢʜᴏꜱᴛɢ-x] Dossier /commands introuvable');
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
          delete require.cache[require.resolve(fullPath)];
          const command = require(fullPath);

          if (command.name) {
            const cmdName = command.name.toLowerCase(); // 🔹 Force minuscule
            command.category = category; 
            commands.set(cmdName, command);

            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                const aliasLow = alias.toLowerCase();
                // 🔹 On n'enregistre l'alias que s'il ne vole pas le nom d'une autre commande
                if (!commands.has(aliasLow)) {
                  commands.set(aliasLow, command);
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

  console.log(`✨ [ɢʜᴏꜱᴛɢ-x] ${commands.size} entrées (Cmds/Alias) chargées.`);
  return commands;
};

module.exports = { loadCommands };
