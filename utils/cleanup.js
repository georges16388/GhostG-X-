/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Global Cleanup System
 * Prevent ENOSPC errors by cleaning old temp files
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// --- CONFIGURATION DU NETTOYAGE ---
const CLEANUP_INTERVAL = 15 * 60 * 1000; // Toutes les 15 minutes
const FILE_AGE_LIMIT = 30 * 60 * 1000;   // Supprime après 30 minutes
const SESSION_DIR = config.sessionName || 'session';

/**
 * Nettoyage des fichiers temporaires périmés
 */
function cleanupOldFiles() {
  try {
    // On cible le dossier temp à la racine du projet
    const tempDir = path.join(__dirname, '../temp');
    
    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    let deletedCount = 0;
    let sizeFreed = 0;

    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      // SÉCURITÉ ABSOLUE : Ne jamais toucher au dossier de session
      if (file === SESSION_DIR || file.includes('auth_info')) continue;

      const filePath = path.join(tempDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        // On ne traite que les fichiers (pas les dossiers pour éviter les accidents)
        if (stats.isFile()) {
          const age = now - stats.mtimeMs;

          if (age > FILE_AGE_LIMIT) {
            sizeFreed += stats.size;
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      } catch (e) {
        // Le fichier est peut-être déjà utilisé par une commande en cours
        continue;
      }
    }

    if (deletedCount > 0) {
      const mb = (sizeFreed / (1024 * 1024)).toFixed(2);
      console.log(`[🧹 CLEANUP]: ${deletedCount} fichiers supprimés | ${mb} MB libérés.`);
    }

  } catch (err) {
    console.error('[CLEANUP ERROR]:', err.message);
  }
}

/**
 * Démarrage du système de maintenance
 */
function startCleanup() {
  // Premier nettoyage au démarrage
  cleanupOldFiles();
  
  // Planification périodique
  setInterval(cleanupOldFiles, CLEANUP_INTERVAL);
  
  console.log(`✅ *sʏsᴛᴇᴍᴇ ᴅᴇ ɴᴇᴛᴛᴏʏᴀɢᴇ ᴀᴄᴛɪғ* (⏳ 15ᴍ)`);
}

module.exports = { startCleanup, cleanupOldFiles };
