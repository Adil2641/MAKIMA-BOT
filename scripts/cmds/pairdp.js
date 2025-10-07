const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// GitHub raw JSON URL
const jsonUrl = "https://raw.githubusercontent.com/Adil2641/Adil-API/refs/heads/main/pairs.js";

module.exports = {
  config: {
    name: "pairdp",
    aliases: ["coupledp", "pair"],
    version: "6.0",
    author: "Dipto",
    countDown: 10,
    role: 0,
    category: "fun",
    shortDescription: "Send a random couple DP from GitHub JSON",
    longDescription: "Fetches a boy-girl DP pair from a GitHub JSON file",
    guide: "{pn}",
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    try {
      // Random waiting messages
      const waitMessages = [
        "✨ Picking the perfect couple DP for you...",
        "💖 Searching for your soulmate DP...",
        "💞 Matching couple vibes...",
        "❤️ Preparing a cute pair for you...",
        "💌 Almost ready with your couple DP..."
      ];

      const waitMsg = await api.sendMessage(
        waitMessages[Math.floor(Math.random() * waitMessages.length)],
        threadID
      );

      // Fetch JSON from GitHub
      const res = await axios.get(jsonUrl);
      const pairs = res.data;

      if (!pairs || !pairs.length) throw new Error("No pairs found in JSON.");

      // Randomly select one pair
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];

      // Download boy image
      const boyBuffer = await axios.get(selectedPair.boy, { responseType: "arraybuffer" });
      const boyPath = path.join(__dirname, "cache", `boy-${Date.now()}.jpg`);
      await fs.outputFile(boyPath, boyBuffer.data);

      // Download girl image
      const girlBuffer = await axios.get(selectedPair.girl, { responseType: "arraybuffer" });
      const girlPath = path.join(__dirname, "cache", `girl-${Date.now()}.jpg`);
      await fs.outputFile(girlPath, girlBuffer.data);

      // Random caption
      const captions = [
        "💞 Perfect Couple Vibes!",
        "❤️ His & Her Matching DPs",
        "✨ Soulmate Aesthetic",
        "💖 Made for Each Other",
        "😍 Cutest Couple Ever!"
      ];
      const caption = captions[Math.floor(Math.random() * captions.length)];

      // Send both images together
      await api.unsendMessage(waitMsg.messageID);
      await api.sendMessage(
        {
          body: caption,
          attachment: [
            fs.createReadStream(boyPath),
            fs.createReadStream(girlPath)
          ],
        },
        threadID,
        messageID
      );

      // Clean up cache after 20 seconds
      setTimeout(() => {
        fs.unlinkSync(boyPath);
        fs.unlinkSync(girlPath);
      }, 20000);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  },
};
