const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "toilet",
    aliases: ["toilet"],
    version: "1.3",
    author: "Upen Basnet (Modified by A.Dil)",
    countDown: 5,
    role: 0,
    shortDescription: "Put mentioned user's face on a toilet meme 😆",
    longDescription: "Places the mentioned user's face on a funny toilet meme image.",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) return message.reply("Please mention someone!");

    const targetID = mention[0]; // only use mentioned user

    const filePath = await makeToiletMeme(targetID);
    message.reply({ 
      body: " Tui ekhane thakar joggo 🐸🤣", 
      attachment: fs.createReadStream(filePath) 
    });
  }
};

async function makeToiletMeme(targetID) {
  // Read the mentioned user’s profile picture
  const avatar = await jimp.read(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avatar.circle();

  // Ensure cache folder exists
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  // Output file path
  const filePath = path.join(cacheDir, `toilet_${Date.now()}.png`);

  // Load base meme image
  const img = await jimp.read("https://i.postimg.cc/dVJpXt4p/sZW2vlz.png");
  img.resize(1080, 1350)
     // Composite only the mentioned user's avatar
     .composite(avatar.resize(450, 450), 300, 660);

  await img.writeAsync(filePath);
  return filePath;
}
