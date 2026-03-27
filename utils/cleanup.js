/**
 * Global Cleanup System - GhostG-X MD Core
 * Prévient les erreurs ENOSPC (Disque Plein)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Intervalle de nettoyage : 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

// Seuil d'âge des fichiers : 30 minutes (pour ne pas supprimer un fichier en cours d'envoi)
const FILE_AGE_THRESHOLD_MS = 30 * 60 * 1000;

// Dossiers à NE JAMAIS TOUCHER (Sécurité Critique)
const FORBIDDEN_PATHS = [
  config.sessionName || 'session',
  'database',
  'node_modules',
  '.git'
];

let cleanupInterval = null;

/**
 * Nettoyage des fichiers temporaires obsolètes
 */
function cleanupOldFiles() {
  try {
    // On cible les dossiers de stockage temporaire habituels
    const targetDirs = [
      path.join(process.cwd(), 'tmp'),
      path.join(process.cwd(), 'temp')
    ];

    const now = Date.now();
    let deletedCount = 0;
    let totalSizeFreed = 0;

    targetDirs.forEach(dir => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        
        // --- SÉCURITÉ ANTI-PURGE SESSION ---
        if (FORBIDDEN_PATHS.some(p => filePath.includes(p))) continue;

        try {
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) continue; // On ne supprime pas les dossiers ici

          const fileAge = now - stats.mtimeMs;

          if (fileAge > FILE_AGE_THRESHOLD_MS) {
            const fileSize = stats.size;
            fs.unlinkSync(filePath);
            deletedCount++;
            totalSizeFreed += fileSize;
          }
        } catch (err) {
          // Fichier peut-être déjà supprimé ou verrouillé, on ignore silencieusement
        }
      }
    });

    if (deletedCount > 0) {
      const sizeMB = (totalSizeFreed / (1024 * 1024)).toFixed(2);
      console.log(`🧹 [ɢʜᴏꜱᴛɢ-x] Cleanup: ${deletedCount} fichiers supprimés (${sizeMB} MB libérés).`);
    }
  } catch (error) {
    console.error('⚠️ [CLEANUP ERROR]:', error.message);
  }
}

/**
 * Démarrage du système de maintenance
 */
function startCleanup() {
  console.log('🧹 [ɢʜᴏꜱᴛɢ-x] Initialisation du système de maintenance...');
  
  // Premier passage immédiat
  cleanupOldFiles();
  
  // Planification périodique
  cleanupInterval = setInterval(cleanupOldFiles, CLEANUP_INTERVAL_MS);
  
  console.log(`✅ [Maintenance] Actif (Cycle: ${CLEANUP_INTERVAL_MS / 60000} min | Seuil: ${FILE_AGE_THRESHOLD_MS / 60000} min)`);
}

/**
 * Arrêt propre du système
 */
function stopCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('🛑 [Maintenance] Système arrêté.');
  }
}

// Gestion des signaux système pour éviter de corrompre des fichiers
process.on('SIGINT', () => { stopCleanup(); process.exit(0); });
process.on('SIGTERM', () => { stopCleanup(); process.exit(0); });

module.exports = {
  cleanupOldFiles,
  startCleanup,
  stopCleanup
};
