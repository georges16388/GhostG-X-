/**
 * System Updater - AGM Global Core (Ultra-Stable Edition)
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
const AGM_UPDATE = (status, info = "") => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🔄
┃ ɪɴғᴏ : ${info} 📁
┃ sᴏᴜʀᴄᴇ : ɢɪᴛʜᴜʙ/ᴍᴀɪɴ 🌐
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

// --- UTILS : RUN COMMAND ---
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || '').toString()));
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

// --- UTILS : RECURSIVE COPY ---
function copyRecursive(src, dest, ignore = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (fs.lstatSync(s).isDirectory()) {
      copyRecursive(s, d, ignore);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

module.exports = {
  name: 'update',
  aliases: ['upgrade', 'patch'],
  category: 'owner',
  description: 'Mise à jour complète avec installation des dépendances.',
  usage: '.update',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const zipUrl = args[0] || config.updateZipUrl || "https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip";
    const from = extra.from;

    try {
      await sock.sendMessage(from, { react: { text: '📡', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟠 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'));

      const tmpDir = path.join(process.cwd(), 'temp_update');
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
      fs.mkdirSync(tmpDir);

      const zipPath = path.join(tmpDir, 'update.zip');
      const extractTo = path.join(tmpDir, 'extract');

      // 1. Téléchargement du ZIP
      await downloadFile(zipUrl, zipPath);

      // 2. Extraction
      await run(process.platform === 'win32' 
        ? `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractTo}' -Force"`
        : `unzip -o '${zipPath}' -d '${extractTo}'`
      );

      // 3. Identification du dossier GitHub (souvent GhostG-X-main)
      const entries = fs.readdirSync(extractTo).filter(e => !e.startsWith('.'));
      const srcRoot = entries.length === 1 ? path.join(extractTo, entries[0]) : extractTo;

      // 4. Copie Sécurisée
      const ignore = ['node_modules', '.git', 'session', 'GhostG-X-Session', 'database', 'config.js', '.env'];
      copyRecursive(srcRoot, process.cwd(), ignore);

      // 5. CRITIQUE : Installation des nouvelles dépendances (npm install)
      await extra.reply(AGM_UPDATE('🔵 ɪɴsᴛᴀʟʟɪɴɢ...', 'ɴᴘᴍ ᴘᴀᴄᴋᴀɢᴇs'));
      await run('npm install');

      // 6. Nettoyage
      fs.rmSync(tmpDir, { recursive: true, force: true });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟢 sᴜᴄᴄᴇss', 'ʀᴇsᴛᴀʀᴛɪɴɢ...'));

      // 7. Redémarrage Intelligent
      setTimeout(() => {
        if (process.env.PM2_HOME || process.env.PM2_JSON) {
          run('pm2 restart all').catch(() => process.exit(0));
        } else {
          process.exit(0);
        }
      }, 3000);

    } catch (error) {
      console.error('Update Error:', error);
      await extra.reply(AGM_UPDATE('🔴 ᴇʀʀᴏʀ', error.message.substring(0, 100)));
    }
  }
};
