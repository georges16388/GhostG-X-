// utils/config.js
import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env")) {
  dotenv.config(); // charge automatiquement le .env
}

const CONFIG = {
  PREFIX: process.env.PREFIX || "'",
  BOT_NAME: process.env.BOT_NAME || "ghostg-x",
  OWNER: process.env.OWNER || "22677487520",
  CHANNEL_ID: process.env.CHANNEL_ID || "120363425540434745@newsletter",
  CHANNEL_NAME: process.env.CHANNEL_NAME || "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
};

export default CONFIG;