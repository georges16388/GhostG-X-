async function getCommandsInfo(commandsPath = path.resolve("./commands")) {
    const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const commandsInfo = {};

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".js"));
        commandsInfo[category] = {};

        for (const file of files) {
            try {
                // Charger le module de commande en ES Module
                const modulePath = path.join(categoryPath, file);
                const commandModule = (await import(`file://${modulePath}`)).default;

                const desc = commandModule.desc || "Pas de description";
                const usage = commandModule.usage || file.replace(".js", "");
                commandsInfo[category][usage] = { desc, usage };

            } catch (err) {
                console.error(`⚠️ Impossible de charger ${file}:`, err.message);
            }
        }
    }

    return commandsInfo;
}
export default getCommandsInfo;