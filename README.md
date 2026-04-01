<p align="center">
  <img src="https://files.catbox.moe/i8wlxl.jpg" alt="ɢʜᴏꜱᴛɢ-x ᴍᴅ ᴘʀᴇsᴛɪɢᴇ" width="100%">
</p>

<h1 align="center">⚡ ɢʜᴏꜱᴛɢ-x ᴍᴅ ᴠ1.1.1 — ᴘʀᴇꜱᴛɪɢᴇ ᴇᴅɪᴛɪᴏɴ</h1>

<p align="center">
  <i>"ʟ'ᴇʟᴇɢᴀɴᴄᴇ ʀᴇᴄᴏɴᴄɪʟɪᴇᴇ ᴀᴠᴇᴄ ʟᴀ ᴘᴜɪssᴀɴᴄᴇ ᴛᴇᴄʜɴɪǫᴜᴇ."</i><br>
  <strong>ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs.</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-gold.svg?style=flat-square" alt="MIT License" />
  </a>
  <a href="https://github.com/georges16388/GhostG-X-/">
    <img src="https://img.shields.io/github/stars/georges16388/GhostG-X-?style=flat-square&color=black" alt="Stars" />
  </a>
  <a href="https://github.com/georges16388/GhostG-X-/network/members">
    <img src="https://img.shields.io/github/forks/georges16388/GhostG-X-?style=flat-square&color=black" alt="Forks" />
  </a>
</p>

---

<details>
  <summary>🚀 ᴅᴇᴘʟᴏɪᴇᴍᴇɴᴛ ᴇʟɪᴛᴇ ɢʜᴏsᴛɢ-x</summary>

### 🧬 Éᴛᴀᴘᴇ 𝟷 : ғᴏʀᴋ ᴅᴜ ᴅᴇᴘᴏᴛ ɢɪᴛʜᴜʙ  
[![Fork GitHub](https://img.shields.io/badge/Fork%20le%20Repo-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/georges16388/GhostG-X-/fork)

---

### 🔐 Éᴛᴀᴘᴇ 𝟸 : ɢᴇɴᴇʀᴇʀ ᴜɴᴇ sᴇssɪᴏɴ ɪᴅ
📌 **ᴄᴏɴsᴇʀᴠᴇ ʟᴀ sᴇssɪᴏɴ-ɪᴅ ᴅᴀɴs ᴜɴ ᴇɴᴅʀᴏɪᴛ sᴇᴄᴜʀɪsᴇ.** [![Obtenir SESSION-ID](https://img.shields.io/badge/Obtenir%20SESSION--ID-0A0A0A?style=for-the-badge&logo=key&logoColor=white)](https://ghostg-session.koyeb.app/)  

---

### 🚀 Éᴛᴀᴘᴇ 𝟹 : ᴍᴇᴛʜᴏᴅᴇs ᴅᴇ ᴅᴇᴘʟᴏɪᴇᴍᴇɴᴛ

#### <img src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white" height="28" />
- [ᴅᴇᴘʟᴏʏᴇʀ sᴜʀ ʜᴇʀᴏᴋᴜ](https://dashboard.heroku.com/new?template=https://github.com/georges16388/GhostG-X-)

#### <img src="https://img.shields.io/badge/Koyeb-000000?style=for-the-badge&logo=koyeb&logoColor=white" height="28" />
- [ᴅᴇᴘʟᴏʏᴇʀ sᴜʀ ᴋᴏʏᴇʙ](https://app.koyeb.com/deploy?type=git&name=ghostg-x&repository=https%3A%2F%2Fgithub.com%2Fgeorges16388%2FGhostG-X-&branch=main&builder=dockerfile&instance_type=free&env%5BPREFIX%5D=.&env%5BOWNER_NAME%5D=Georges&env%5BOWNER_NUMBER%5D=22651622652&env%5BMODE%5D=public&env%5BSESSION_ID%5D=)

#### <img src="https://img.shields.io/badge/Panel-grey?style=for-the-badge&logo=windows-terminal&logoColor=white" height="28" />
- Ajoutez le fichier `index.js` (voir ci-dessous) et démarrez.

</details>

---

<details>
  <summary>📝 sᴄʀɪᴘᴛ ɪɴᴅᴇx.ᴊs ᴘᴏᴜʀ ᴘᴀɴᴇʟ</summary>

```js
const { spawnSync, spawn } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');

const env_file = `
OWNER_NUMBER=22651622652
PAIRING_CODE=true
PREFIX=.
SELF_MODE=false
SESSION_ID=votre_session_ici
`;

function setupProject() {
  if (!existsSync('ghostg')) {
    const clone = spawnSync('git', ['clone', '[https://github.com/georges16388/GhostG-X-](https://github.com/georges16388/GhostG-X-)', 'ghostg'], { stdio: 'inherit' });
    if (clone.status !== 0) process.exit(1);
  }

  if (!existsSync('ghostg/.env')) {
    mkdirSync('ghostg', { recursive: true });
    writeFileSync('ghostg/.env', env_file);
    console.log("✅ Fichier .env GhostG-X créé.");
  }

  spawnSync('npm', ['install'], { cwd: 'ghostg', stdio: 'inherit' });
}

function launchApp() {
  const child = spawn('node', ['index.js'], { cwd: 'ghostg', stdio: 'inherit' });
  child.on('exit', () => launchApp());
}

setupProject();
launchApp();
