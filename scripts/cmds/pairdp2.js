const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Dynamic Base API Loader
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Adil2641/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "pairdp2",
    aliases: ["pair2", "coupledp2"],
    version: "1.2",
    author: "Dipto x Vex_Kshitiz",
    countDown: 10,
    role: 0,
    shortDescription: "Matching pair profile pictures",
    longDescription: "Generates pair DPs using Pinterest image search",
    category: "image",
    guide: {
      en: "{pn} zoro and sanji -2",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      const input = args.join(" ");
      const [queries, imageIndex] = input.split(" -");

      if (!queries || !imageIndex) {
        return message.reply(
          "❌ | Please provide two queries separated by 'and' and the image index with '-'.\nExample: pairdp2 zoro and sanji -2"
        );
      }

      const [query1, query2] = queries.split(" and ");
      if (!query1 || !query2) {
        return message.reply(
          "❌ | Please provide two queries separated by 'and'.\nExample: pairdp2 zoro and sanji -2"
        );
      }

      const searchQuery = `${query1} and ${query2}`;
      const apiBase = await baseApiUrl();
      const apiUrl = `${apiBase}/pinterest?search=${encodeURIComponent(
        searchQuery
      )}&limit=10`;

      const loadingMsg = await api.sendMessage(
        "⏳ | Searching Pinterest for matching images...",
        event.threadID
      );

      const response = await axios.get(apiUrl);
      const imageData = response.data.data;

      if (!imageData || imageData.length === 0) {
        await api.unsendMessage(loadingMsg.messageID);
        return message.reply("❌ | No matching pair images found!");
      }

      const index = parseInt(imageIndex) - 1;
      if (index < 0 || index >= imageData.length) {
        await api.unsendMessage(loadingMsg.messageID);
        return message.reply(
          `❌ | Invalid index! Choose between 1 and ${imageData.length}.`
        );
      }

      const imageUrl = imageData[index];
      const imgResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const image = await loadImage(imgResponse.data);

      const width = image.width;
      const height = image.height;
      const halfWidth = width / 2;

      const canvasLeft = createCanvas(halfWidth, height);
      const ctxLeft = canvasLeft.getContext("2d");
      ctxLeft.drawImage(image, 0, 0, halfWidth, height, 0, 0, halfWidth, height);

      const canvasRight = createCanvas(halfWidth, height);
      const ctxRight = canvasRight.getContext("2d");
      ctxRight.drawImage(image, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);

      const cacheFolder = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);

      const timestamp = Date.now();
      const leftPath = path.join(cacheFolder, `${timestamp}_left.png`);
      const rightPath = path.join(cacheFolder, `${timestamp}_right.png`);

      await Promise.all([
        fs.promises.writeFile(leftPath, canvasLeft.toBuffer("image/png")),
        fs.promises.writeFile(rightPath, canvasRight.toBuffer("image/png")),
      ]);

      await api.unsendMessage(loadingMsg.messageID);
      await api.sendMessage(
        {
          body: `✨ 𝐏𝐚𝐢𝐫 𝐃𝐏 𝐈𝐦𝐚𝐠𝐞\n🔍 Search: ${searchQuery}\n📸 Index: ${imageIndex}`,
          attachment: [
            fs.createReadStream(leftPath),
            fs.createReadStream(rightPath),
          ],
        },
        event.threadID,
        event.messageID
      );

      // Cleanup cache
      fs.unlinkSync(leftPath);
      fs.unlinkSync(rightPath);
      console.log("✅ Images sent successfully and cache cleaned");
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred while generating pair DP.");
    }
  },
};
