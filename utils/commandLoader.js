const fs = require('fs');
const path = require('path');

const loadCommands = (dir = path.join(__dirname, '..', 'commands')) => {
    const commands = new Map();
    if (!fs.existsSync(dir)) return commands;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    let totalLoaded = 0;

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            const subCommands = loadCommands(fullPath);
            for (const [name, cmd] of subCommands) commands.set(name, cmd);
        } else if (item.isFile() && item.name.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const command = require(fullPath);

                if (command.name) {
                    commands.set(command.name.toLowerCase(), command);
                    totalLoaded++;

                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            commands.set(alias.toLowerCase(), command);
                        });
                    }
                }
            } catch (error) {
                console.error(`❌ [LOAD_FAIL] ${fullPath} -> ${error.message}`);
            }
        }
    }

    // Log uniquement à la racine
    if (dir.endsWith('commands')) {
        console.log(`╭╼━≪• ᴀɢᴍ ᴄᴏᴍᴍᴀɴᴅ ᴄᴏʀᴇ •≫━╾╮
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ᴀʟʟ ꜱʏꜱᴛᴇᴍꜱ ɢᴏ
┃ ʟᴏᴀᴅᴇᴅ : ${totalLoaded} ᴄᴏᴍᴍᴀɴᴅꜱ
╰━━━━━━━━━━━━━━━╯`);
    }

    return commands;
};

module.exports = { loadCommands };