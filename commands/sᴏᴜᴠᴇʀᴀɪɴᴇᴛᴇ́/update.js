/**
 * Update Command - GhostG-X Prestige Edition
 * Récupère le dernier code via une archive ZIP
 * PRÉSERVE : node_modules, session, .env, config.js, etc.
 * AUTOMATISE : npm install si nécessaire
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

let config;
try {
  config = require('../../config');
} catch (e) {
  config = {};
}

const prefix = config.prefix || '.';
const MAX_REDIRECTS = 5;

// Fonction utilitaire pour Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  const cleanedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
      resolve((stdout || '').toString());
    });
  });
}

async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
    await run(cmd);
    return;
  }
  
  // Sur Linux, on tente unzip puis 7z
  try { await run(`unzip -o '${zipPath}' -d '${outDir}'`); return; } catch {}
  try { await run(`7z x -y '${zipPath}' -o'${outDir}'`); return; } catch {}
  throw new Error('Aucun outil d\'extraction trouvé sur le système (unzip/7z). Installez-le sur votre VPS.');
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    if (visited.has(url) || visited.size > MAX_REDIRECTS) return reject(new Error('Trop de redirections'));
    visited.add(url);
    const client = url.startsWith('https://') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'GhostG-X-Updater/2.0' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        return downloadFile(new URL(res.headers.location, url).toString(), dest, visited).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;

    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.copyFileSync(s, d);
      outList.push(path.join(relative, entry).replace(/\\/g, '/'));
    }
  }
}

async function updateViaZip(zipUrl) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, 'update.zip');
  const extractTo = path.join(tmpDir, 'update_extract');

  await downloadFile(zipUrl, zipPath);
  if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
  await extractZip(zipPath, extractTo);

  const entries = fs.readdirSync(extractTo);
  const rootCandidate = entries.length === 1 ? path.join(extractTo, entries[0]) : extractTo;
  const srcRoot = fs.existsSync(rootCandidate) && fs.lstatSync(rootCandidate).isDirectory() ? rootCandidate : extractTo;

  // 🛡️ LISTE DES ÉLÉMENTS PRÉSERVÉS (RÈGLE D'OR)
  const ignore = [
    'node_modules',
    '.git',
    'session',
    'tmp',
    'temp',
    'database',
    'config.js',
    '.env'
  ];

  // Vérification de mise à jour des dépendances
  let needNpmInstall = false;
  const oldPkgPath = path.join(process.cwd(), 'package.json');
  const newPkgPath = path.join(srcRoot, 'package.json');

  if (fs.existsSync(oldPkgPath) && fs.existsSync(newPkgPath)) {
    const oldPkg = fs.readFileSync(oldPkgPath, 'utf-8');
    const newPkg = fs.readFileSync(newPkgPath, 'utf-8');
    if (oldPkg !== newPkg) {
      needNpmInstall = true;
    }
  }

  const copied = [];
  copyRecursive(srcRoot, process.cwd(), ignore, '', copied);

  // Nettoyage
  try { fs.rmSync(extractTo, { recursive: true, force: true }); fs.rmSync(zipPath, { force: true }); } catch {}

  // Installation auto des dépendances si nécessaire
  let npmSuccess = true;
  if (needNpmInstall) {
    try {
      await run('npm install --production');
    } catch (e) {
      console.error('Erreur npm install:', e);
      npmSuccess = false;
    }
  }

  return { copiedFiles: copied, needNpmInstall, npmSuccess };
}

module.exports = {
  name: 'ᴍɪsᴇ_ᴀ_ᴊᴏᴜʀ',
  aliases: ['update', 'maj'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: `**『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴇ ᴍᴇᴛ ᴀ̀ ᴊᴏᴜʀ ᴅᴇᴘᴜɪs ʟᴇ ʀᴇᴘᴏ ᴅᴇ ʟ'ᴏʀᴀᴄʟᴇ`,
  usage: `${prefix}ᴍɪsᴇ_ᴀ_ᴊᴏᴜʀ [ʟɪᴇɴ_ᴢɪᴘ]`,

  async execute(sock, msg, args, extra) {
    const { isOwner, reply, from } = extra;

    if (!isOwner) return reply(`*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*`);

    const zipUrl = (args[0] || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();

    if (!zipUrl) {
      return reply(`*〆 ᴀᴜᴄᴜɴ ʟɪᴇɴ ᴅᴇ ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴛʀᴏᴜᴠᴇ́.*`);
    }

    try {
      await reply(`*🔮 ʟ\'ᴏʀᴀᴄʟᴇ ᴘʀᴏᴄᴇ̀ᴅᴇ ᴀ̀ ʟ\'ᴀsᴘɪʀᴀᴛɪᴏɴ ᴅᴇs ɴᴏᴜᴠᴇᴀᴜx ᴀʀᴄᴀɴᴇs... ᴘᴀᴛɪᴇɴᴛᴇ.*`);

      const { copiedFiles, needNpmInstall, npmSuccess } = await updateViaZip(zipUrl);

      let summary = `*✅ ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴀᴄᴄᴏᴍᴘʟɪᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s !*\n*📦 ғɪᴄʜɪᴇʀs ᴍɪs ᴀ̀ ᴊᴏᴜʀ : ${copiedFiles.length}*\n*🛡️ ᴛᴏɴ sᴇssɪᴏɴ, ᴛᴏɴ ᴄᴏɴғɪɢ.ᴊs ᴇᴛ ᴛᴏɴ .ᴇɴᴠ ᴏɴᴛ ᴇ́ᴛᴇ́ ᴘʀᴇ́sᴇʀᴠᴇ́s.*`;

      if (needNpmInstall) {
        if (npmSuccess) {
          summary += `\n\n*⚡ ʟᴇs ɴᴏᴜᴠᴇʟʟᴇs ᴅᴇ́ᴘᴇɴᴅᴀɴᴄᴇs ᴏɴᴛ ᴇ́ᴛᴇ́ ɪɴsᴛᴀʟʟᴇ́ᴇs !*`;
        } else {
          summary += `\n\n*⚠️ ʟ\'ɪɴsᴛᴀʟʟᴀᴛɪᴏɴ ᴅᴇs ᴅᴇ́ᴘᴇɴᴅᴀɴᴄᴇs ᴀ ᴇ́ᴄʜᴏᴜᴇ́. ғᴀɪs ᴜɴ 'ɴᴘᴍ ɪɴsᴛᴀʟʟ' ᴍᴀɴᴜᴇʟ.*`;
        }
      }

      await sock.sendMessage(from, { text: `${summary}\n\n*🔄 ʀᴇ́ɪɴᴄᴀʀɴᴀᴛɪᴏɴ (ʀᴇᴅᴇ́ᴍᴀʀʀᴀɢᴇ) ᴇɴ ᴄᴏᴜʀs...*` }, { quoted: msg });

      setTimeout(() => process.exit(0), 1500);
    } catch (error) {
      await reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
