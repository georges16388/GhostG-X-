/**
 * Update Command - GhostG-X Edition
 * Récupère le dernier code via une archive ZIP
 * Préserve les répertoires d'état : node_modules, session, tmp, temp, database, config.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../../config');

const MAX_REDIRECTS = 5;

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
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\\\/g, '/')}' -Force"`;
    await run(cmd);
    return;
  }
  try {
    await run('command -v unzip');
    await run(`unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  try {
    await run('command -v 7z');
    await run(`7z x -y '${zipPath}' -o'${outDir}'`);
    return;
  } catch {}
  try {
    await run('busybox unzip -h');
    await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  throw new Error('Aucun outil d\'extraction trouvé (unzip/7z/busybox). Installe-en un ou utilise un panel supportant l\'extraction.');
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    try {
      if (visited.has(url) || visited.size > MAX_REDIRECTS) {
        return reject(new Error('Trop de redirections'));
      }
      visited.add(url);

      const client = url.startsWith('https://') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'GhostG-X-Updater/1.0',
          'Accept': '*/*'
        }
      }, res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          if (!location) return reject(new Error(`HTTP ${res.statusCode} sans localisation`));
          const nextUrl = new URL(location, url).toString();
          res.resume();
          return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', err => {
          try { file.close(() => {}); } catch {}
          fs.unlink(dest, () => reject(err));
        });
      });
      req.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    } catch (e) {
      reject(e);
    }
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
      if (outList) outList.push(path.join(relative, entry).replace(/\\\\/g, '/'));
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

  const ignore = [
    'node_modules',
    '.git',
    'session',
    'tmp',
    'temp',
    'database',
    'config.js'
  ];
  const copied = [];
  copyRecursive(srcRoot, process.cwd(), ignore, '', copied);

  try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(zipPath, { force: true }); } catch {}

  return { copiedFiles: copied };
}

module.exports = {
  name: 'ᴍɪsᴇ_ᴀ_ᴊᴏᴜʀ',
  aliases: ['update', 'upgrade', 'maj'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴅᴇᴘᴜɪs ᴜɴ ʟɪᴇɴ ᴢɪᴘ (ᴏᴡɴᴇʀ sᴇᴜʟᴇᴍᴇɴᴛ)',
  usage: '.ᴍɪsᴇ_ᴀ_ᴊᴏᴜʀ [ʟɪᴇɴ_ᴢɪᴘ_ᴏᴘᴛɪᴏɴɴᴇʟ]',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const { isOwner, reply, from } = extra;
    
    // 🔥 LE FIX : Utilisation du booléen isOwner du handler (numéro du .env)
    if (!isOwner) {
      return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
    }

    const zipUrl = (args[0] || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();

    if (!zipUrl) {
      return reply('*〆 ᴀᴜᴄᴜɴ ʟɪᴇɴ ᴅᴇ ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴄᴏɴғɪɢᴜʀᴇ́ ! sᴘᴇ́ᴄɪғɪᴇ-ʟᴇ ᴅᴀɴs ʟᴇ `ᴄᴏɴғɪɢ.ᴊs` ᴏᴜ ᴘᴀssᴇ ʟᴇ ᴇɴ ᴀʀɢᴜᴍᴇɴᴛ : .ᴍɪsᴇ_ᴀ_ᴊᴏᴜʀ <ʟɪᴇɴ_ᴢɪᴘ>*');
    }

    try {
      await reply('*🔄 ᴀsᴘɪʀᴀᴛɪᴏɴ ᴅᴇs ɴᴏᴜᴠᴇᴀᴜx ᴀʀᴄᴀɴᴇs, ᴠᴇᴜɪʟʟᴇᴢ ᴘᴀᴛɪᴇɴᴛᴇʀ...*');

      const { copiedFiles } = await updateViaZip(zipUrl);

      const summary = copiedFiles.length
        ? `*✅ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴛᴇʀᴍɪɴᴇ́ᴇ. ғɪᴄʜɪᴇʀs ʀᴇғᴏʀɢᴇ́s : ${copiedFiles.length}*`
        : '*✅ ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ ᴀᴄᴄᴏᴍᴘʟɪᴇ. ᴀᴜᴄᴜɴ ғɪᴄʜɪᴇʀ ɴ\'ᴀ ᴇᴜ ʙᴇsᴏɪɴ ᴅᴇ ᴄʜᴀɴɢᴇᴍᴇɴᴛ.*';

      await sock.sendMessage(from, { text: `${summary}\n*ʀᴇ́ɪɴᴄᴀʀɴᴀᴛɪᴏɴ...*` }, { quoted: msg });

      // Laisse le temps au message de partir
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        await run('pm2 restart all');
        return;
      } catch {}

      setTimeout(() => process.exit(0), 500);
    } catch (error) {
      console.error('Update failed:', error);
      await sock.sendMessage(from, { text: `*〆 ʟ\'ᴀsᴘɪʀᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ :*\n\`${String(error.message || error)}\`` }, { quoted: msg });
    }
  }
};
