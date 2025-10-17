const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

// === CACHE DIRECTORY ===
const cacheDir = path.join(__dirname, "cache");
fs.ensureDirSync(cacheDir); 

// === DOWNLOAD FILE FUNCTION ===
async function downloadFile(url, filePath) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "video/mp4,video/*;q=0.9,*/*;q=0.8" }
    });
    await fs.writeFile(filePath, response.data);
    return fs.createReadStream(filePath);
  } catch (err) {
    throw new Error(`Download failed: ${err.response?.status || err.message}`);
  }
}

// === RANDOM UTILS ===
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  config: {
    name: "info",
    version: "3.1",
    author: "A Dil",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Show bot and owner info" },
    longDescription: { en: "Display stylish bot info with cached/random video and random design" },
    category: "owner",
    guide: { en: "{p}info" }
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const botName = "⋆˚🦋ʸᵒᵘʳ𝙼𝚊𝚔𝚒𝚖𝚊🎀🍓⋆˚";
      const botPrefix = "+";
      const authorName = "A Dil";
      const ownAge = "16";
      const teamName = "GitHub Team";
      const authorFB = "https://www.facebook.com/a.dil.605376?mibextid=ZbWKwL";
      const authorInsta = "https://www.instagram.com/a_dil2642/profilecard/?igsh=dmU5aW92eGh6MWxo";

      const videoLinks = [
        "https://github.com/Adil2641/Adil-API/raw/refs/heads/main/video/makima.mp4",
        "https://github.com/Adil2641/Adil-API/raw/refs/heads/main/video/makima-2.mp4",
        "https://github.com/Adil2641/Adil-API/raw/refs/heads/main/video/makima-3.mp4"
      ];
      const randomIndex = Math.floor(Math.random() * videoLinks.length);
      const selectedVideo = videoLinks[randomIndex];
      const videoName = `info_video_${randomIndex}.mp4`;
      const videoPath = path.join(cacheDir, videoName);

      let videoStream;
      if (fs.existsSync(videoPath)) {
        videoStream = fs.createReadStream(videoPath);
      } else {
        videoStream = await downloadFile(selectedVideo, videoPath);
      }

      const now = moment().tz("Asia/Dhaka");
      const date = now.format("dddd, MMMM Do YYYY");
      const time = now.format("h:mm:ss A");

      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / 3600) % 24);
      const days = Math.floor(uptime / 86400);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const senderName = await usersData.getName(event.senderID);

      // === RANDOM DESIGN ELEMENTS ===
      const borders = ["🌸 ━━━━━━━━━━━━━━━━━ 🌸", "💫 ✦✧✦✧✦✧ ✦✧💫", "✨━━━━━━━━━━━━━━✨"];
      const greetings = [
        `💌 𝙷𝚎𝚢 ${senderName},`,
        `🌟 Hello ${senderName}!`,
        `💖 Yo ${senderName}, check this out!`
      ];
      const closings = [
        "💠 Stay cute, stay productive 💠",
        "🌈 Keep shining, friend! 🌈",
        "🔥 Power up your day! 🔥"
      ];

      // === RANDOMLY CHOSEN TEXTS ===
      const borderTop = randomChoice(borders);
      const borderBottom = randomChoice(borders);
      const greeting = randomChoice(greetings);
      const closing = randomChoice(closings);

      const infoText = `
${borderTop}
${greeting}
Here’s my current system status 💫

🩵 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${botName}
🔹 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}
👑 𝗢𝘄𝗻𝗲𝗿: ${authorName}
🎂 𝗔𝗴𝗲: ${ownAge}
🚀 𝗧𝗲𝗮𝗺: ${teamName}

📅 𝗗𝗮𝘁𝗲: ${date}
🕔 𝗧𝗶𝗺𝗲: ${time}
⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeString}

🌐 𝗦𝗼𝗰𝗶𝗮𝗹𝘀:
📘 Facebook: ${authorFB}
📸 Instagram: ${authorInsta}

${closing}
${borderBottom}`;

      await message.reply({ body: infoText, attachment: videoStream });

    } catch (err) {
      console.error("❌ Error in info command:", err);
      message.reply("⚠️ Unable to display bot info right now. Please try again later.");
    }
  },

  onChat: async function ({ event, message, usersData }) {
    const body = event.body?.toLowerCase();
    if (body === "info") {
      this.onStart({ message, event, usersData });
    }
  }
};
