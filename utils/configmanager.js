import fs from 'fs';

// Paths
const configPath = 'config.json';
const premiumPath = 'db.json';

// 🔹 Load config
let config = {};
if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        console.log('✅ Config file read successfully');
    } catch (e) {
        console.log('❌ Error reading config.json, resetting...');
        config = { users: {} };
    }
} else {
    console.log('⚠️ config.json not found, creating default');
    config = { users: {} };
}

// 🔹 Load premium users
let premiums = {};
if (fs.existsSync(premiumPath)) {
    try {
        premiums = JSON.parse(fs.readFileSync(premiumPath, 'utf-8'));
        console.log('✅ Premium users loaded');
    } catch (e) {
        console.log('❌ Error reading db.json, resetting...');
        premiums = { premiumUser: {} };
    }
} else {
    console.log('⚠️ db.json not found, creating default');
    premiums = { premiumUser: {} };
}

// 🔹 Save functions
function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('💾 Config saved');
}

function savePremium() {
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
    console.log('💎 Premium users saved');
}

// 🔹 Exported manager with get/set
export default {
    config,
    premiums,

    saveP() {
        savePremium()
    },
    save() {
        saveConfig()
    },

    // 🔹 nouvelle méthode pour récupérer la config d’un bot
    getUser(botId) {
        return this.config.users?.[botId] || null;
    }
}