/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Hybrid Database (JSON for Settings + SQLite for Anti-Delete)
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const sqlite3 = require('sqlite3').verbose(); // On importe SQLite

const DB_PATH = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB = path.join(DB_PATH, 'users.json');
const WARNINGS_DB = path.join(DB_PATH, 'warnings.json');
const MODS_DB = path.join(DB_PATH, 'mods.json');
const MESSAGES_DB = path.join(DB_PATH, 'ghostg_messages.db'); // Fichier SQLite

// --- INITIALISATION ---
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialisation SQLite pour l'Anti-Delete
const db = new sqlite3.Database(MESSAGES_DB);
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        msgId TEXT PRIMARY KEY,
        remoteJid TEXT,
        participant TEXT,
        pushName TEXT,
        content TEXT,
        timestamp INTEGER
    )`);
});

const initDB = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initDB(GROUPS_DB, {});
initDB(USERS_DB, {});
initDB(WARNINGS_DB, {});
initDB(MODS_DB, { moderators: [] });

// --- FONCTIONS JSON EXISTANTES (GARDÉES) ---
const readDB = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading database: ${error.message}`);
    return {};
  }
};

const writeDB = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing database: ${error.message}`);
    return false;
  }
};

// --- SYSTÈME SQLITE (POUR ANTI-DELETE) ---

/**
 * Sauvegarde un message pour pouvoir le récupérer s'il est supprimé
 */
const saveMessage = (msg) => {
    const msgId = msg.key.id;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const name = msg.pushName || 'User';
    const content = JSON.stringify(msg.message);
    const time = Date.now();

    db.run(`INSERT OR REPLACE INTO messages (msgId, remoteJid, participant, pushName, content, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?)`, [msgId, from, sender, name, content, time]);
    
    // Nettoyage automatique : supprime les messages de plus de 12h pour rester léger
    db.run(`DELETE FROM messages WHERE timestamp < ?`, [Date.now() - 43200000]);
};

/**
 * Récupère un message par son ID
 */
const getMessage = (msgId) => {
    return new Promise((resolve) => {
        db.get(`SELECT * FROM messages WHERE msgId = ?`, [msgId], (err, row) => {
            if (row) row.content = JSON.parse(row.content);
            resolve(row || null);
        });
    });
};

// --- EXPORTS ---
module.exports = {
  // Fonctions JSON
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  getWarnings,
  addWarning,
  removeWarning,
  clearWarnings,
  getModerators,
  addModerator,
  removeModerator,
  isModerator,
  // Fonctions SQLite
  saveMessage,
  getMessage
};

// Fonctions Group Settings (copiées ici pour l'export correct)
function getGroupSettings(groupId) {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
    writeDB(GROUPS_DB, groups);
  }
  return groups[groupId];
}
function updateGroupSettings(groupId, settings) {
  const groups = readDB(GROUPS_DB);
  groups[groupId] = { ...groups[groupId], ...settings };
  return writeDB(GROUPS_DB, groups);
}
// ... (Les autres fonctions restent identiques dans ton fichier original)
