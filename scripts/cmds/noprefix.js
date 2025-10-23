const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "noprefix",
    version: "3.0",
    author: "A Dil",
    countDown: 5,
    role: 0,
    description: {
      en: "No prefix audio/video responses (from GitHub).",
    },
    shortDescription: "no prefix",
    longDescription:
      "Send anime-style reactions in audio or video form. Supports .mp3 and .mp4 files hosted on GitHub. Type 'list' to view available items.",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message, api }) {
    if (!event.body) return;
    const word = event.body.toLowerCase();

    // 🟩 Base GitHub URL
    const baseUrl =
      "https://raw.githubusercontent.com/Adil2641/Adil-Resources/main/no-prefix-cmd/";

    // 🎵 / 🎬 Media list
    const media = {
      ara: { file: "ara.mp3", text: "「 𝐀𝐫𝐚 𝐚𝐫𝐚😜 」", react: "😜" },
      yamete: { file: "yamete.mp3", text: "「 𝐘𝐚𝐦𝐞𝐭𝐞 𝐤𝐮𝐝𝐚𝐬𝐚𝐢💋😛 」", react: "😛" },
      haha: { file: "haha.mp3", text: "「 Na Has Hai muji 」", react: "😒" },
      bankai: { file: "bankai.mp3", text: "「 𝐁𝐚𝐧𝐤𝐚𝐢⛩️ 」", react: "😈" },
      yowaimo: { file: "yowaimo.mp3", text: "「 𝐘𝐨𝐰𝐚𝐢𝐦𝐨🤞 」", react: "🤞" },
      umai: { file: "umai.mp3", text: "「 𝐔𝐦𝐚𝐢😤😤 」", react: "🐸" },
      onichan: { file: "onichan.mp3", text: "「 🍒𝐎𝐧𝐢𝐜𝐡𝐚𝐧🍒 」", react: "🍒" },
      itachi: { file: "itachi.mp3", text: "「 𝐈𝐭𝐚𝐜𝐡𝐢🐦‍⬛ 」", react: "🐦‍⬛" },
      uzumaki: { file: "uzumaki.mp3", text: "「 𝐔𝐳𝐮𝐦𝐚𝐤𝐢🦊 」", react: "🦊" },
      dattebayo: { file: "dattebayo.mp3", text: "「 𝐃𝐚𝐭𝐭𝐞𝐛𝐚𝐲𝐨🍥 」", react: "🍥" },
      rasengan: { file: "rasengan.mp3", text: "「 𝐑𝐚𝐬𝐞𝐧𝐠𝐚𝐧🌀 」", react: "🌀" },
      naruto: { file: "naruto.mp3", text: "「 🍜𝐍𝐚𝐫𝐮𝐭𝐨🍜 」", react: "🍜" },
      ahh: { file: "ahh.mp3", text: "「 𝗔𝗵𝗵🥵 」", react: "🥵" },
      wow: { file: "wow.mp3", text: "「 𝗪𝗼𝘄😱 」", react: "😱" },
      titan: { file: "titan.mp3", text: "「 𝗧𝗶𝘁𝗮𝗻🗿 」", react: "🗿" },
      sukuna: { file: "sukuna.mp3", text: "「 💀𝗦𝘂𝗸𝘂𝗻𝗮⛩️ 」", react: "💀" },
      punch: { file: "punch.mp3", text: "「 👊𝐏𝐮𝐧𝐜𝐡👊 」", react: "👊" },
      jujutsu: { file: "jujutsu.mp3", text: "「 🤞🏻𝐉𝐮𝐣𝐮𝐭𝐬𝐮🤞🏻 」", react: "🤞🏻" },

      // 🎬 Makima — random video selection
      makima: {
        files: ["makima.mp4", "makima-2.mp4", "makima-3.mp4"],
        text: "「 💋𝐌𝐚𝐤𝐢𝐦𝐚💄 」",
        react: "💋",
      },
    };

    // 📋 List command
    if (word === "list") {
      const listMsg =
        "📌𝗡𝗼 𝗽𝗿𝗲𝗳𝗶𝘅 𝗺𝗲𝗱𝗶𝗮 𝗹𝗶𝘀𝘁📝:\n═════════════════\n" +
        Object.keys(media)
          .map(
            (k, i) =>
              `${i + 1}. ${k} (${
                media[k].file?.endsWith(".mp4") || media[k].files ? "🎬" : "🎵"
              })`
          )
          .join("\n");
      await message.reply(listMsg);
      await api.setMessageReaction("📋", event.messageID);
      return;
    }

    const item = media[word];
    if (!item) return;

    try {
      // 🎲 Pick random file if multiple
      const fileName = item.files
        ? item.files[Math.floor(Math.random() * item.files.length)]
        : item.file;

      const fileUrl = baseUrl + fileName;
      const fileExt = path.extname(fileName).toLowerCase();
      const tempPath = path.join(__dirname, `cache_${Date.now()}${fileExt}`);

      // ✅ Check if file exists on GitHub
      const headCheck = await axios.head(fileUrl).catch(() => null);
      if (!headCheck || headCheck.status !== 200) {
        return message.reply(`⚠️ Media file not found on GitHub:\n${fileName}`);
      }

      // 📥 Download file
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
      await fs.writeFile(tempPath, response.data);

      // 🎬 Detect video vs audio
      const isVideo = fileExt === ".mp4";
      await message.reply({
        body: item.text,
        attachment: fs.createReadStream(tempPath),
      });

      // 💬 Add reaction
      await api.setMessageReaction(item.react, event.messageID);

      // 🧹 Cleanup temp file
      setTimeout(() => fs.unlink(tempPath).catch(() => {}), 15000);
    } catch (err) {
      console.error("❌ Error loading media:", err.message);
      message.reply("⚠️ Could not load or send playable media!");
    }
  },
};
