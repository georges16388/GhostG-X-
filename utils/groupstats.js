/**
 * Group Analytics System - AGM Group-Stats
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'groupStats.json');

// --- INITIALISATION SÉCURISÉE ---
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDB() {
    try {
        if (!fs.existsSync(DB_PATH)) return {};
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error('❌ [ᴀɢᴍ_ꜱᴛᴀᴛꜱ_ʟᴏᴀᴅ_ᴇʀʀᴏʀ] :', e.message);
        return {};
    }
}

function saveDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ [ᴀɢᴍ_ꜱᴛᴀᴛꜱ_ꜱᴀᴠᴇ_ᴇʀʀᴏʀ] :', err);
    }
}

/**
 * Enregistre l'activité d'un membre
 */
function addMessage(groupId, senderId) {
    const db = loadDB();
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours().toString();

    // Nettoyage de l'ID JID (ex: remove :1)
    const cleanSender = senderId.split('@')[0];

    if (!db[groupId]) db[groupId] = {};
    if (!db[groupId][today]) {
        db[groupId][today] = {
            total: 0,
            users: {},
            hours: {}
        };
    }

    const g = db[groupId][today];
    g.total++;
    g.users[cleanSender] = (g.users[cleanSender] || 0) + 1;
    g.hours[hour] = (g.hours[hour] || 0) + 1;

    saveDB(db);
}

/**
 * Récupère le Top 5 des membres les plus actifs
 */
function getTopActive(groupId) {
    const db = loadDB();
    const today = new Date().toISOString().slice(0, 10);
    if (!db[groupId] || !db[groupId][today]) return null;

    const users = db[groupId][today].users;
    return Object.entries(users)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Retourne le Top 5
}

module.exports = { addMessage, getTopActive };
