/**
 * Global Cleanup System - AGM Clean-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { getTempDir } = require('./tempManager');
const config = require('../config');

// --- CONFIGURATION DU NETTOYAGE ---
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
const FILE_AGE_LIMIT = 30 * 60 * 1000;  // 30 minutes
const SESSION_NAME = config.sessionName || 'session';

/**
 * Rapport de nettoyage AGM
 */
const AGM_CLEAN_REPORT = (count, size) => `╭╼━≪• ᴀɢᴍ ᴄʟᴇᴀɴ ꜱʏꜱᴛᴇᴍ •≫━╾╮
┃ ꜰɪʟᴇꜱ ᴅᴇʟᴇᴛᴇᴅ : ${count} 🗑️
┃ ꜱᴘᴀᴄᴇ ꜰʀᴇᴇᴅ : ${size} ᴍʙ ♻️
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ᴏᴘᴛɪᴍɪᴢᴇᴅ
╰━━━━━━━━━━━━━━━╯`;

/**
 * Nettoyage des fichiers temporaires
 */
function cleanupOldFiles() {
  try {
    const tempDir = getTempDir();
    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    let deletedCount = 0;
    let totalSizeFreed = 0;

    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      // SÉCURITÉ ABSOLUE : Ne jamais toucher à la session
      if (file === SESSION_NAME || file.includes('creds.json')) continue;

      const filePath = path.join(tempDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) continue;

        if (now - stats.mtimeMs > FILE_AGE_LIMIT) {
          totalSizeFreed += stats.size;
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (e) { /* Fichier peut-être déjà supprimé ou utilisé */ }
    }

    if (deletedCount > 0) {
      const sizeMB = (totalSizeFreed / (1024 * 1024)).toFixed(2);
      console.log(AGM_CLEAN_REPORT(deletedCount, sizeMB));
    }
  } catch (error) {
    console.error('❌ [ᴀɢᴍ_ᴄʟᴇᴀɴ_ᴇʀʀᴏʀ] :', error.message);
  }
}

/**
 * Lancement du système de maintenance
 */
function startCleanup() {
  console.log('🧹 *ᴀɢᴍ ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ : sᴛᴀʀᴛɪɴɢ...*');
  cleanupOldFiles();
  
  setInterval(() => cleanupOldFiles(), CLEANUP_INTERVAL);
  console.log(`✅ *ᴀɢᴍ ᴍᴀɪɴᴛᴇɴᴀɴᴄᴇ : ᴀᴄᴛɪᴠᴇ (ᴇᴠᴇʀʏ ${CLEANUP_INTERVAL / 60000} ᴍɪɴ)*`);
}

module.exports = { cleanupOldFiles, startCleanup };
