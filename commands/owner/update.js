/**
 * System Updater - AGM Global Core (Ultra-Stable Edition)
 * Source: https://github.com/georges16388/GhostG-X-
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// --- DESIGN AGM ELITE ---
const AGM_UPDATE = (status, info = "SYSTEM") => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🔄
┃ ᴛᴀsᴋ : ${info} ⚙️
┃ sᴏᴜʀᴄᴇ : ɢɪᴛʜᴜʙ/ᴍᴀɪɴ 🌐
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

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
  aliases: ['upgrade', 'patch', 'up'],
  category: 'owner',
  description: 'Mise à jour complète du système GhostG-X.',
  usage: '.update',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const from = msg.key.remoteJid;
    // On récupère l'URL depuis la config ou l'argument, sinon défaut
    const zipUrl = args[0] || "https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip";

    try {
      await sock.sendMessage(from, { react: { text: '📡', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟠 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ', 'ғᴇᴛᴄʜɪɴɢ ᴢɪᴘ...'));

      const tmpDir = path.join(process.cwd(), 'temp_update');
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
      fs.mkdirSync(tmpDir);

      const zipPath = path.join(tmpDir, 'update.zip');
      const extractTo = path.join(tmpDir, 'extract');

      // 1. Téléchargement
      await downloadFile(zipUrl, zipPath);

      // 2. Extraction (Correction pour Linux/Windows)
      await extra.reply(AGM_UPDATE('🟡 ᴇxᴛʀᴀᴄᴛɪɴɢ', 'ᴜɴᴢɪᴘᴘɪɴɢ ғɪʟᴇs'));
      if (process.platform === 'win32') {
        await run(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractTo}' -Force"`);
      } else {
        await run(`unzip -o "${zipPath}" -d "${extractTo}"`);
      }

      // 3. Identification du dossier source
      const entries = fs.readdirSync(extractTo).filter(e => !e.startsWith('.'));
      const srcRoot = entries.length === 1 ? path.join(extractTo, entries[0]) : extractTo;

      // 4. Copie Sécurisée (On ne touche pas à la config ni à la session)
      const ignore = ['node_modules', '.git', 'session', 'GhostG-X-Session', 'database', 'config.js', '.env', 'package-lock.json'];
      copyRecursive(srcRoot, process.cwd(), ignore);

      // 5. Installation des dépendances
      await extra.reply(AGM_UPDATE('🔵 ɪɴsᴛᴀʟʟɪɴɢ', 'ɴᴘᴍ ᴘᴀᴄᴋᴀɢᴇs...'));
      await run('npm install');

      // 6. Nettoyage
      fs.rmSync(tmpDir, { recursive: true, force: true });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      await extra.reply(AGM_UPDATE('🟢 sᴜᴄᴄᴇss', 'ʀᴇsᴛᴀʀᴛɪɴɢ ɴᴏᴡ'));

      // 7. Redémarrage
      setTimeout(() => {
        process.exit(0); // Le process manager (PM2/Panel) relancera le bot
      }, 3000);

    } catch (error) {
      console.error('[UPDATE ERROR]:', error);
      await extra.reply(AGM_UPDATE('🔴 ᴇʀʀᴏʀ', error.message.substring(0, 50)));
    }
  }
};
