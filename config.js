// config.js
import fs from 'fs';

// Valeurs par défaut
export const PREFIX = '`';
export const BOT_NUMBER = '22677487520'; // valeur par défaut si .env absent

// Lecture manuelle du .env
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

// Exporte pour utilisation dans tous les fichiers
export const PREFIX = "`";
export const BOT_NUMBER = "22677487520";