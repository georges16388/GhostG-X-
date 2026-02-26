// utils/configmanager.js
import fs from "fs";
import CONFIG from "./config.js"; // ton config.js qui charge le .env

// 🔹 Paths
const configPath = "config.json";
const premiumPath = "db.json";

// 🔹 Load global config
let config = { users: {} };
if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        console.log("✅ Config file loaded");
    } catch (e) {
        console.log("❌ Config error, reset");
        config = { users: {} };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
} else {
    console.log("⚠️ config.json not found → creating");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// 🔹 Load premium users
let premiums = { premiumUser: {} };
if (fs.existsSync(premiumPath)) {
    try {
        premiums = JSON.parse(fs.readFileSync(premiumPath, "utf-8"));
        console.log("✅ Premium loaded");
    } catch (e) {
        console.log("❌ db.json error, reset");
        premiums = { premiumUser: {} };
        fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
    }
} else {
    console.log("⚠️ db.json not found → creating");
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
}

// 🔹 Save functions
function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function savePremium() {
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
}

// 🔹 EXPORT
export default {
    config,
    premiums,

    // --- Save global / premium
    save() {
        saveConfig();
    },
    saveP() {
        savePremium();
    },

    // --- GET / SET global key
    get(key) {
        return config[key];
    },
    set(key, value) {
        config[key] = value;
        saveConfig();
    },

    // --- GET user config
    getUser(botId) {
        if (!config.users) config.users = {};

        if (!config.users[botId]) {
            // Par défaut, prend le prefix du .env
            config.users[botId] = {
                prefix: CONFIG.PREFIX || "!"
            };
            saveConfig();
        }

        return config.users[botId];
    },

    // --- SET user config
    setUser(botId, data) {
        if (!config.users) config.users = {};

        config.users[botId] = {
            ...config.users[botId],
            ...data
        };

        saveConfig();
    },

    // --- Premium helpers
    isPremium(userId) {
        return !!premiums.premiumUser[userId];
    },
    addPremium(userId) {
        premiums.premiumUser[userId] = true;
        savePremium();
    },
    removePremium(userId) {
        delete premiums.premiumUser[userId];
        savePremium();
    }
};