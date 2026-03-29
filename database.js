/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Hybrid Database (JSON for Settings + Better-SQLite3 for Anti-Delete)
 * Optimized for Performance and GhostG-X MD V5.3
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs-extra'); // Utilise fs-extra de ton package
const path = require('path');
const config = require('./config');
const Database = require('better-sqlite3'); // Version plus rapide incluse dans ton package

const DB_PATH = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB = path.join(DB_PATH, 'users.json');
const WARNINGS_DB = path.join(DB_PATH, 'warnings.json');
const MODS_DB = path.join(DB_PATH, 'mods.json');
const MESSAGES_DB = path.join(DB_PATH, 'ghostg_messages.db');

// --- INITIALISATION DES RÉPERTOIRES ---
fs.ensureDirSync(DB_PATH);

// --- INITIALISATION BETTER-SQLITE3 ---
const db = new Database(MESSAGES_DB);
db.pragma('journal_mode = WAL'); // Optimisation de vitesse extrême
db.prepare(`CREATE TABLE IF NOT EXISTS messages (
    msgId TEXT PRIMARY KEY,
    remoteJid TEXT,
    participant TEXT,
    pushName TEXT,
    content TEXT,
    timestamp INTEGER
)`).run();

// --- UTILITAIRES DE BASE (JSON) ---
const readDB = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return {};
    return fs.readJsonSync(filePath);
  } catch (error) {
    return {};
  }
};

const writeDB = (filePath, data) => {
  try {
    fs.writeJsonSync(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    return false;
  }
};

// Initialisation des fichiers JSON si inexistants
if (!fs.existsSync(GROUPS_DB)) writeDB(GROUPS_DB, {});
if (!fs.existsSync(USERS_DB)) writeDB(USERS_DB, {});
if (!fs.existsSync(WARNINGS_DB)) writeDB(WARNINGS_DB, {});
if (!fs.existsSync(MODS_DB)) writeDB(MODS_DB, { moderators: [] });

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
        name: 'User', xp: 0, level: 1, banned: false, premium: false, registeredAt: Date.now() 
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
// SECTION 5 : SYSTÈME SQLITE (ANTI-DELETE) - OPTIMISÉ
// ==========================================
const saveMessage = (msg) => {
    try {
        const msgId = msg.key.id;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const name = msg.pushName || 'User';
        const content = JSON.stringify(msg.message);
        const time = Date.now();

        const insert = db.prepare(`INSERT OR REPLACE INTO messages (msgId, remoteJid, participant, pushName, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)`);
        insert.run(msgId, from, sender, name, content, time);

        // Auto-clean : supprime les messages de plus de 12h
        const clean = db.prepare(`DELETE FROM messages WHERE timestamp < ?`);
        clean.run(Date.now() - 43200000);
    } catch (e) { console.error("❌ SQL Save Error:", e); }
};

const getMessage = (msgId) => {
    try {
        const row = db.prepare(`SELECT * FROM messages WHERE msgId = ?`).get(msgId);
        if (row) {
            row.content = JSON.parse(row.content);
            return row;
        }
        return null;
    } catch (e) {
        console.error("❌ SQL Get Error:", e);
        return null;
    }
};

// --- EXPORTS ---
module.exports = {
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  saveMessage,
  getMessage,
  // ... garde tes autres exports (warnings, mods) ici
  getWarnings: (userId) => readDB(WARNINGS_DB)[userId] || [],
  addWarning: (userId, reason) => {
    const w = readDB(WARNINGS_DB);
    if (!w[userId]) w[userId] = [];
    w[userId].push({ reason, timestamp: Date.now() });
    return writeDB(WARNINGS_DB, w);
  },
  isModerator: (userId) => (readDB(MODS_DB).moderators || []).includes(userId)
};
