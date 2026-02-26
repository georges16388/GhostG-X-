import fs from "fs";

// valeurs par défaut
let config = {
    PREFIX: "'",
    BOT_NAME: "ghostg-x",
    OWNER: "22677487520",
    CHANNEL_ID: "120363425540434745@newsletter",
    CHANNEL_NAME: "phantom-x tech"
};

// lecture du .env
if (fs.existsSync("./.env")) {
    const env = fs.readFileSync("./.env", "utf8");

    env.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (!key || !value) return;

        const v = value.trim();

        if (key === "PREFIX") config.PREFIX = v;
        if (key === "BOT_NAME") config.BOT_NAME = v;
        if (key === "OWNER") config.OWNER = v;
        if (key === "CHANNEL_ID") config.CHANNEL_ID = v;
        if (key === "CHANNEL_NAME") config.CHANNEL_NAME = v;
    });
}

export default config;