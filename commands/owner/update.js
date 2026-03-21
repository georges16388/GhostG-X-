/**
 * System Updater - AGM Global Core
 * Source: https://github.com/georges16388/GhostG-X-
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../../config');

// --- DESIGN AGM ---
const AGM_UPDATE = (status, files = 0) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🔄
┃ ғɪʟᴇs : ${files} 📁
┃ sᴏᴜʀᴄᴇ : ɢɪᴛʜᴜʙ/ᴍᴀɪɴ 🌐
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

// --- UTILS : RUN COMMAND ---
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
      resolve((stdout || '').toString());
    });
  });
}

// --- UTILS : DOWNLOAD ZIP ---
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'AGM-Updater' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

// --- UTILS : EXTRACT ZIP ---
async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    await run(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force"`);
  } else {
    try { await run(`unzip -o '${zipPath}' -d '${outDir}'`); }
    catch { await run(`7z x -y '${zipPath}' -o'${outDir}'`); }
  }
}

// --- UTILS : RECURSIVE COPY ---
function copyRecursive(src, dest, ignore = [], copied = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (fs.lstatSync(s).isDirectory()) {
      copyRecursive(s, d, ignore, copied);
    } else {
      fs.copyFileSync(s, d);
      copied.push(entry);
    }
  }
}

module.exports = {
  name: 'update',
  aliases: ['upgrade', 'patch'],
  category: 'owner',
  description: 'Mettre à jour le bot depuis le repo GitHub officiel',
  usage: '.update',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const zipUrl = args[0] || config.updateZipUrl;

    if (!zipUrl) {
      return extra.reply('❌ *ᴀᴜᴄᴜɴᴇ ᴜʀʟ ᴅᴇ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅéғɪɴɪᴇ ᴅᴀɴs ᴄᴏɴғɪɢ.ᴊs*');
    }

    try {
      await sock.sendMessage(extra.from, { react: { text: '📡', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟠 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'));

      const tmpDir = path.join(process.cwd(), 'temp_update');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
      
      const zipPath = path.join(tmpDir, 'update.zip');
      const extractTo = path.join(tmpDir, 'extract');

      // 1. Téléchargement
      await downloadFile(zipUrl, zipPath);

      // 2. Extraction
      if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
      await extractZip(zipPath, extractTo);

      // 3. Identification du dossier racine (GitHub rajoute souvent un nom de dossier)
      const entries = fs.readdirSync(extractTo);
      const srcRoot = entries.length === 1 ? path.join(extractTo, entries[0]) : extractTo;

      // 4. Copie des fichiers (en ignorant les fichiers sensibles)
      const ignore = ['node_modules', '.git', 'session', 'tmp', 'temp', 'database', 'config.js', '.env'];
      const copied = [];
      copyRecursive(srcRoot, process.cwd(), ignore, copied);

      // 5. Nettoyage
      fs.rmSync(tmpDir, { recursive: true, force: true });

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟢 sᴜᴄᴄᴇss', copied.length));

      // 6. Redémarrage
      setTimeout(async () => {
        try { await run('pm2 restart all'); } catch { process.exit(0); }
      }, 2000);

    } catch (error) {
      console.error('Update Error:', error);
      await extra.reply(`❌ *éᴄʜᴇᴄ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};
