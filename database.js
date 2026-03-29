/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Hybrid Database (Full JSON pour Settings + Anti-Delete)
 * Optimized for Performance and GhostG-X MD V5.3
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs-extra'); 
const path = require('path');
const config = require('./config');

const DB_PATH = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB = path.join(DB_PATH, 'users.json');
const WARNINGS_DB = path.join(DB_PATH, 'warnings.json');
const MODS_DB = path.join(DB_PATH, 'mods.json');
const MESSAGES_DB = path.join(DB_PATH, 'messages.json'); // Changé en .json !

// --- INITIALISATION DES RÉPERTOIRES ---
fs.ensureDirSync(DB_PATH);

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
if (!fs.existsSync(MESSAGES_DB)) writeDB(MESSAGES_DB, {}); // Init pour l'Anti-Delete

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
// SECTION 5 : SYSTÈME JSON (ANTI-DELETE) - SANS SQLITE
// ==========================================
const saveMessage = (msg) => {
    try {
        const msgId = msg.key.id;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const name = msg.pushName || 'User';
        const content = msg.message; // Plus besoin de JSON.stringify ici !
        const time = Date.now();

        const messages = readDB(MESSAGES_DB);
        
        // On enregistre le message
        messages[msgId] = {
            msgId,
            remoteJid: from,
            participant: sender,
            pushName: name,
            content,
            timestamp: time
        };

        // Auto-clean : supprime les messages de plus de 12h
        const limitTime = Date.now() - 43200000;
        for (const id in messages) {
            if (messages[id].timestamp < limitTime) {
                delete messages[id];
            }
        }

        writeDB(MESSAGES_DB, messages);
    } catch (e) { console.error("❌ Message Save Error:", e); }
};

const getMessage = (msgId) => {
    try {
        const messages = readDB(MESSAGES_DB);
        const row = messages[msgId];
        if (row) {
            return row; // Plus besoin de JSON.parse ici !
        }
        return null;
    } catch (e) {
        console.error("❌ Message Get Error:", e);
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
  getWarnings: (userId) => readDB(WARNINGS_DB)[userId] || [],
  addWarning: (userId, reason) => {
    const w = readDB(WARNINGS_DB);
    if (!w[userId]) w[userId] = [];
    w[userId].push({ reason, timestamp: Date.now() });
    return writeDB(WARNINGS_DB, w);
  },
  isModerator: (userId) => (readDB(MODS_DB).moderators || []).includes(userId)
};
