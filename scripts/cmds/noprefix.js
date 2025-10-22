const axios = require("axios");

module.exports = {
  config: {
    name: "noprefix",
    version: "2.1",
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

    // 🟩 Base GitHub URL (replace with your own repo)
    const baseUrl =
      "https://raw.githubusercontent.com/Adil2641/Adil-API/refs/heads/main/no-prefix-cmd/";

    // 🎵 or 🎬 — you can freely mix mp3 and mp4 here
    const media = {
      ara: { file: "ara.mp3", text: "「 𝐀𝐫𝐚 𝐚𝐫𝐚😜 」", react: "😜" },
      yamete: { file: "yamete.mp4", text: "「 𝐘𝐚𝐦𝐞𝐭𝐞 𝐤𝐮𝐝𝐚𝐬𝐚𝐢💋😛 」", react: "😛" },
      machikney: { file: "machikney.mp3", text: "「 Machikney 」", react: "🤨" },
      haha: { file: "haha.mp3", text: "「 Na Has Hai muji 」", react: "😒" },
      bankai: { file: "bankai.mp4", text: "「 𝐁𝐚𝐧𝐤𝐚𝐢⛩️ 」", react: "😈" },
      yowaimo: { file: "yowaimo.mp3", text: "「 𝐘𝐨𝐰𝐚𝐢𝐦𝐨🤞 」", react: "🤞" },
      umai: { file: "umai.mp4", text: "「 𝐔𝐦𝐚𝐢😤😤 」", react: "🐸" },
      onichan: { file: "onichan.mp4", text: "「 🍒𝐎𝐧𝐢𝐜𝐡𝐚𝐧🍒 」", react: "🍒" },
      itachi: { file: "itachi.mp3", text: "「 𝐈𝐭𝐚𝐜𝐡𝐢🐦‍⬛ 」", react: "🐦‍⬛" },
      uzumaki: { file: "uzumaki.mp4", text: "「 𝐔𝐳𝐮𝐦𝐚𝐤𝐢🦊 」", react: "🦊" },
      dattebayo: { file: "dattebayo.mp3", text: "「 𝐃𝐚𝐭𝐭𝐞𝐛𝐚𝐲𝐨🍥 」", react: "🍥" },
      rasengan: { file: "rasengan.mp4", text: "「 𝐑𝐚𝐬𝐞𝐧𝐠𝐚𝐧🌀 」", react: "🌀" },
    };

    // 📋 List of all available
    if (word === "list") {
      const listMsg =
        "📌𝗡𝗼 𝗽𝗿𝗲𝗳𝗶𝘅 𝗺𝗲𝗱𝗶𝗮 𝗹𝗶𝘀𝘁📝:\n═════════════════\n" +
        Object.keys(media)
          .map((k, i) => `${i + 1}. ${k} (${media[k].file.endsWith(".mp4") ? "🎬" : "🎵"})`)
          .join("\n");
      await message.reply(listMsg);
      await api.setMessageReaction("📋", event.messageID, event.threadID, api);
      return;
    }

    // 🔊 Find the command
    const item = media[word];
    if (!item) return;

    try {
      const fileUrl = baseUrl + item.file;
      const response = await axios.get(fileUrl, { responseType: "stream" });

      message.reply({
        body: item.text,
        attachment: response.data,
      });

      await api.setMessageReaction(item.react, event.messageID, event.threadID, api);
    } catch (err) {
      console.error(err);
      message.reply("⚠️ Could not load media from GitHub!");
    }
  },
};
