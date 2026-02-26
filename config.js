// config.js
import fs from 'fs';

// Valeurs par défaut
let PREFIX = '`';
let BOT_NUMBER = '22677487520';

// Lecture manuelle du .env (si présent)
if (fs.existsSync('./.env')) {
    const envFile = fs.readFileSync('./.env', 'utf8');

    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (!key || !value) return;

        const cleanValue = value.trim();
        if (key === 'PREFIX') PREFIX = cleanValue;
        if (key === 'BOT_NUMBER') BOT_NUMBER = cleanValue;
    });
}

// Export pour utilisation dans tous les fichiers
export { PREFIX, BOT_NUMBER };