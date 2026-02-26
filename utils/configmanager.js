import fs from 'fs';

// Paths
const configPath = 'config.json';
const premiumPath = 'db.json';

// 🔹 Load config
let config = { users: {} };

if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        console.log('✅ Config file loaded');
    } catch (e) {
        console.log('❌ Config error, reset');
    }
} else {
    console.log('⚠️ config.json not found → creating');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// 🔹 Load premium
let premiums = { premiumUser: {} };

if (fs.existsSync(premiumPath)) {
    try {
        premiums = JSON.parse(fs.readFileSync(premiumPath, 'utf-8'));
        console.log('✅ Premium loaded');
    } catch (e) {
        console.log('❌ db.json error, reset');
    }
} else {
    console.log('⚠️ db.json not found → creating');
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
}

// 🔹 Save
function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function savePremium() {
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
}

// 🔥 EXPORT
export default {

    config,
    premiums,

    save() {
        saveConfig();
    },

    saveP() {
        savePremium();
    },

    // ✅ GET GLOBAL
    get(key) {
        return config[key];
    },

    // ✅ SET GLOBAL
    set(key, value) {
        config[key] = value;
        saveConfig();
    },

    // ✅ GET USER (SAFE)
    getUser(botId) {
        if (!config.users) config.users = {};

        if (!config.users[botId]) {
            config.users[botId] = {
                prefix: "!"
            };
            saveConfig();
        }

        return config.users[botId];
    },

    // ✅ SET USER
    setUser(botId, data) {
        if (!config.users) config.users = {};

        config.users[botId] = {
            ...config.users[botId],
            ...data
        };

        saveConfig();
    }
};