/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Hybrid Database (JSON for Settings + SQLite for Anti-Delete)
 * Optimized for Performance and GhostG-X MD V5.3
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB = path.join(DB_PATH, 'users.json');
const WARNINGS_DB = path.join(DB_PATH, 'warnings.json');
const MODS_DB = path.join(DB_PATH, 'mods.json');
const MESSAGES_DB = path.join(DB_PATH, 'ghostg_messages.db');

// --- INITIALISATION DES RÉPERTOIRES ---
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// --- INITIALISATION SQLITE ---
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

// --- UTILITAIRES DE BASE ---
const initDB = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

const readDB = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ DB Read Error (${path.basename(filePath)}):`, error.message);
    return {};
  }
};

const writeDB = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ DB Write Error (${path.basename(filePath)}):`, error.message);
    return false;
  }
};

initDB(GROUPS_DB, {});
initDB(USERS_DB, {});
initDB(WARNINGS_DB, {});
initDB(MODS_DB, { moderators: [] });

// ==========================================
// SECTION 1 : GESTION DES GROUPES (JSON)
// ==========================================
const getGroupSettings = (groupId) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
    writeDB(GROUPS_DB, groups);
  }
  return groups[groupId];
};

const updateGroupSettings = (groupId, settings) => {
  const groups = readDB(GROUPS_DB);
  groups[groupId] = { ...(groups[groupId] || config.defaultGroupSettings), ...settings };
  return writeDB(GROUPS_DB, groups);
};

// ==========================================
// SECTION 2 : GESTION DES UTILISATEURS (JSON)
// ==========================================
const getUser = (userId) => {
  const users = readDB(USERS_DB);
  if (!users[userId]) {
    users[userId] = { 
        name: 'User', 
        xp: 0, 
        level: 1, 
        banned: false, 
        premium: false,
        registeredAt: Date.now() 
    };
    writeDB(USERS_DB, users);
  }
  return users[userId];
};

const updateUser = (userId, data) => {
  const users = readDB(USERS_DB);
  users[userId] = { ...(users[userId] || {}), ...data };
  return writeDB(USERS_DB, users);
};

// ==========================================
// SECTION 3 : GESTION DES AVERTISSEMENTS (JSON)
// ==========================================
const getWarnings = (userId) => {
  const warnings = readDB(WARNINGS_DB);
  return warnings[userId] || [];
};

const addWarning = (userId, reason = 'No reason') => {
  const warnings = readDB(WARNINGS_DB);
  if (!warnings[userId]) warnings[userId] = [];
  warnings[userId].push({ reason, timestamp: Date.now() });
  return writeDB(WARNINGS_DB, warnings);
};

const removeWarning = (userId) => {
  const warnings = readDB(WARNINGS_DB);
  if (warnings[userId] && warnings[userId].length > 0) {
    warnings[userId].pop();
    writeDB(WARNINGS_DB, warnings);
  }
  return warnings[userId] || [];
};

const clearWarnings = (userId) => {
  const warnings = readDB(WARNINGS_DB);
  delete warnings[userId];
  return writeDB(WARNINGS_DB, warnings);
};

// ==========================================
// SECTION 4 : MODÉRATEURS / SUPRÊMES (JSON)
// ==========================================
const getModerators = () => readDB(MODS_DB).moderators || [];

const addModerator = (userId) => {
  const db = readDB(MODS_DB);
  if (!db.moderators.includes(userId)) {
    db.moderators.push(userId);
    writeDB(MODS_DB, db);
  }
  return true;
};

const removeModerator = (userId) => {
  const db = readDB(MODS_DB);
  db.moderators = db.moderators.filter(id => id !== userId);
  return writeDB(MODS_DB, db);
};

const isModerator = (userId) => getModerators().includes(userId);

// ==========================================
// SECTION 5 : SYSTÈME SQLITE (ANTI-DELETE)
// ==========================================
const saveMessage = (msg) => {
    try {
        const msgId = msg.key.id;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const name = msg.pushName || 'User';
        const content = JSON.stringify(msg.message);
        const time = Date.now();

        db.run(`INSERT OR REPLACE INTO messages (msgId, remoteJid, participant, pushName, content, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?)`, [msgId, from, sender, name, content, time]);

        // Auto-clean : supprime les messages de plus de 12h
        db.run(`DELETE FROM messages WHERE timestamp < ?`, [Date.now() - 43200000]);
    } catch (e) { console.error("❌ SQL Save Error:", e); }
};

const getMessage = (msgId) => {
    return new Promise((resolve) => {
        db.get(`SELECT * FROM messages WHERE msgId = ?`, [msgId], (err, row) => {
            if (err) {
                console.error("❌ SQL Get Error:", err);
                return resolve(null);
            }
            if (row) {
                try { row.content = JSON.parse(row.content); } catch(e) { row.content = {}; }
            }
            resolve(row || null);
        });
    });
};

// --- EXPORTS ---
module.exports = {
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
  saveMessage,
  getMessage
};
