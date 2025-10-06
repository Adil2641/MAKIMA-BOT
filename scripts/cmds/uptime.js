const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🌐 Dynamic API base from GitHub (Dipto System)
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Adil2641/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.0",
    author: "✨ Vex_Kshitiz & 🧠 Dipto",
    role: 0,
    shortDescription: {
      en: "⏰ Show bot's uptime with a Makima vibe 💞"
    },
    longDescription: {
      en: "💫 Check how long your bot has been alive — with a random Makima image for a cool aesthetic touch 💋"
    },
    category: "👑 Owner",
    guide: {
      en: "💡 Use: {p}uptime"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // 💖 Makima-themed search keywords
      const searchQueries = [
        "Makima aesthetic",
        "Makima cute pic",
        "Chainsaw Man Makima",
        "Makima anime art",
        "Chainsawman couple wallpaper"
      ];

      // 🎲 Pick a random one
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];

      // 🌐 Fetch from Dipto’s base API
      const apiBase = await baseApiUrl();
      const apiUrl = `${apiBase}/pinterest?search=${encodeURIComponent(randomQuery)}&limit=10`;

      const response = await axios.get(apiUrl);
      const images = response.data.data;

      if (!images || images.length === 0) {
        return api.sendMessage("❌ No Makima images found right now!", event.threadID, event.messageID);
      }

      // 🖼️ Choose a random image
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const imageRes = await axios.get(randomImage, { responseType: "arraybuffer" });

      const imgFolder = path.join(__dirname, "cache");
      await fs.ensureDir(imgFolder);
      const imagePath = path.join(imgFolder, `uptime_${Date.now()}.jpg`);
      await fs.outputFile(imagePath, imageRes.data);

      // ⏳ Calculate uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime / (60 * 60)) % 24);
      const minutes = Math.floor((uptime / 60) % 60);
      const seconds = Math.floor(uptime % 60);

      // 🕰️ Build human-readable uptime string
      let uptimeString = `🕓 ${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (days === 0) {
        uptimeString = `🕓 ${hours}h ${minutes}m ${seconds}s`;
        if (hours === 0) {
          uptimeString = `🕓 ${minutes}m ${seconds}s`;
          if (minutes === 0) {
            uptimeString = `🕓 ${seconds}s`;
          }
        }
      }

      // 💌 Build fancy message
      const msg = `
╔══❖◆❖══╗
✨ 𝑩𝒐𝒕 𝑼𝒑𝒕𝒊𝒎𝒆 𝑺𝒕𝒂𝒕𝒖𝒔 ✨
╚══❖◆❖══╝

👑 𝐇𝐞𝐥𝐥𝐨 𝐌𝐚𝐬𝐭𝐞𝐫,
🤖 𝐘𝐨𝐮𝐫 𝐁𝐨𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐚𝐜𝐭𝐢𝐯𝐞 𝐟𝐨𝐫:
${uptimeString}

💖 𝐌𝐚𝐤𝐢𝐦𝐚 𝐬𝐚𝐲𝐬: “𝐊𝐞𝐞𝐩 𝐦𝐞 𝐨𝐧𝐥𝐢𝐧𝐞, 𝐌𝐚𝐬𝐭𝐞𝐫~ 💋”
      `;

      // 💬 Send message with image
      await api.sendMessage(
        {
          body: msg.trim(),
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        event.messageID
      );

      // 🧹 Clean cache
      await fs.unlink(imagePath);
    } catch (error) {
      console.error("⚠️ Uptime Command Error:", error.message);
      return api.sendMessage("❌ Something went wrong while fetching uptime!", event.threadID, event.messageID);
    }
  }
};
