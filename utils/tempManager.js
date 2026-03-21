/**
 * Centralized Temp Management - AGM Temp-Core
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- DÉFINITION DU HUB TEMPORAIRE ---
const PROJECT_ROOT = process.cwd();
const TEMP_DIR = path.join(PROJECT_ROOT, 'temp');

/**
 * Initialise le système de fichiers temporaires
 * À appeler au tout début du index.js
 */
function initializeTempSystem() {
  const tempDirAbsolute = path.resolve(TEMP_DIR);
  
  // Injection dans les variables d'environnement globales
  process.env.TMPDIR = tempDirAbsolute;
  process.env.TMP = tempDirAbsolute;
  process.env.TEMP = tempDirAbsolute;
  
  // Sécurité Windows
  if (process.platform === 'win32') {
    process.env.USERPROFILE = tempDirAbsolute; 
  }
  
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log('📁 [ᴀɢᴍ_ꜱʏꜱᴛᴇᴍ] : ᴛᴇᴍᴘ ᴅɪʀᴇᴄᴛᴏʀʏ ᴄʀᴇᴀᴛᴇᴅ');
  }
  
  return TEMP_DIR;
}

/**
 * Récupère le chemin du dossier temp (Auto-fix si supprimé)
 */
function getTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  return TEMP_DIR;
}

/**
 * Génère un chemin de fichier temporaire unique
 */
function createTempFilePath(prefix = 'agm', ext = 'tmp') {
  const name = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  return path.join(getTempDir(), name);
}

/**
 * Suppression sécurisée (Ne touche rien hors du dossier /temp)
 */
function deleteTempFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return false;

    const resolvedPath = path.resolve(filePath);
    const tempDirResolved = path.resolve(TEMP_DIR);
    
    // Bouclier de sécurité : empêche de supprimer index.js ou la session par erreur
    if (resolvedPath.startsWith(tempDirResolved)) {
      fs.unlinkSync(filePath);
      return true;
    } else {
      console.warn(`⚠️ [ᴀɢᴍ_ꜱᴇᴄᴜʀɪᴛʏ] : ʙʟᴏᴄᴋᴇᴅ ᴅᴇʟᴇᴛɪᴏɴ ᴏᴜᴛꜱɪᴅᴇ ᴛᴇᴍᴘ -> ${filePath}`);
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Suppression de masse
 */
function deleteTempFiles(filePaths = []) {
  if (!Array.isArray(filePaths)) return;
  filePaths.forEach(file => deleteTempFile(file));
}

module.exports = {
  initializeTempSystem,
  getTempDir,
  createTempFilePath,
  deleteTempFile,
  deleteTempFiles,
  TEMP_DIR
};
