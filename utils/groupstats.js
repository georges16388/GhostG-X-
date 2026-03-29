/**
 * Group Analytics System - AGM Group-Stats
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs-extra'); // Plus rapide et gère mieux les erreurs
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/groupStats.json');

// Cache en mémoire pour éviter de lire le disque à chaque message
let statsCache = {};

// Initialisation au démarrage
if (fs.existsSync(DB_PATH)) {
    try {
        statsCache = fs.readJsonSync(DB_PATH);
    } catch (e) {
        statsCache = {};
    }
}

/**
 * Enregistre l'activité d'un membre (Optimisé RAM)
 */
function addMessage(groupId, senderId) {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours().toString();

    if (!statsCache[groupId]) statsCache[groupId] = {};
    if (!statsCache[groupId][today]) {
        statsCache[groupId][today] = {
            total: 0,
            users: {},
            hours: {}
        };
    }

    const g = statsCache[groupId][today];
    g.total++;
    
    // On garde le JID complet en interne, on splittera à l'affichage
    g.users[senderId] = (g.users[senderId] || 0) + 1;
    g.hours[hour] = (g.hours[hour] || 0) + 1;

    // Sauvegarde asynchrone pour ne pas bloquer le bot
    saveToDisk();
}

// Fonction de sauvegarde "Debounce" (évite d'écrire 100 fois par seconde)
let saveTimeout;
function saveToDisk() {
    if (saveTimeout) return;
    saveTimeout = setTimeout(() => {
        fs.writeJson(DB_PATH, statsCache, { spaces: 2 })
            .catch(err => console.error('❌ [ᴀɢᴍ_ꜱᴛᴀᴛꜱ_ꜱᴀᴠᴇ_ᴇʀʀᴏʀ] :', err));
        saveTimeout = null;
    }, 5000); // Sauvegarde toutes les 5 secondes s'il y a du mouvement
}

/**
 * Récupère le Top 5 des membres
 */
function getTopActive(groupId) {
    const today = new Date().toISOString().slice(0, 10);
    if (!statsCache[groupId] || !statsCache[groupId][today]) return null;

    const users = statsCache[groupId][today].users;
    return Object.entries(users)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
}

// Export des fonctions et du cache pour l'accès direct
module.exports = { addMessage, getTopActive, statsCache };
