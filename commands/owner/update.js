/**
 * Update Command - AGM Cloud Sync (Owner Only)
 * Spécialement conçu pour le repo : GhostG-X-
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- DESIGN AGM ---
const AGM_UPDATE = (status, files = 0) => `╭╼━≪• ᴜᴘᴅᴀᴛᴇ sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status}
┃ ꜰɪʟᴇs : ${files} 📁
┃ sᴏᴜʀᴄᴇ : ɢɪᴛʜᴜʙ ☁️
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'update',
  aliases: ['upgrade', 'sync'],
  category: 'owner',
  description: 'Mise à jour du bot depuis le dépôt GitHub (Owner Only)',
  usage: '.update',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    // URL par défaut vers ton repo (Branche main/master)
    const repoUrl = "https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip";
    const tmpZip = path.join(process.cwd(), 'temp_update.zip');
    const extractDir = path.join(process.cwd(), 'temp_extract');

    try {
      await react('⏳');
      await reply("🔄 *Synchronisation avec le Cloud GhostG-X en cours...*");

      // 1. Téléchargement du ZIP
      await downloadFile(repoUrl, tmpZip);

      // 2. Extraction
      if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir);
      await extractZip(tmpZip, extractDir);

      // 3. Identification du dossier racine (GitHub ajoute un suffixe au dossier dans le ZIP)
      const folders = fs.readdirSync(extractDir);
      const rootFolder = path.join(extractDir, folders[0]);

      // 4. Déploiement sélectif (On ignore les fichiers sensibles)
      const ignore = ['node_modules', 'session', 'database', 'config.js', '.git', 'tmp', 'temp'];
      const updatedFiles = [];
      
      deployFiles(rootFolder, process.cwd(), ignore, updatedFiles);

      // 5. Nettoyage
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(tmpZip);

      await react('✅');
      await reply(AGM_UPDATE("🟢 sᴜᴄᴄᴇss", updatedFiles.length));
      
      // 6. Redémarrage
      await reply("⚠️ *Redémarrage du système pour appliquer les changements...*");
      setTimeout(() => process.exit(0), 1000);

    } catch (error) {
      console.error(error);
      await react('❌');
      await reply(`❌ *Échec de la mise à jour :* ${error.message}`);
    }
  }
};

/**
 * Télécharge le fichier depuis GitHub
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

/**
 * Extrait le ZIP (Compatible Linux/Termux/Windows)
 */
function extractZip(zipPath, outDir) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' 
      ? `powershell Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force`
      : `unzip -o '${zipPath}' -d '${outDir}'`;
    
    exec(cmd, (err) => err ? reject(err) : resolve());
  });
}

/**
 * Copie les fichiers en ignorant les données utilisateur
 */
function deployFiles(src, dest, ignore, list) {
  const entries = fs.readdirSync(src);
  for (const entry of entries) {
    if (ignore.includes(entry)) continue;
    
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
      deployFiles(srcPath, destPath, ignore, list);
    } else {
      fs.copyFileSync(srcPath, destPath);
      list.push(entry);
    }
  }
}
