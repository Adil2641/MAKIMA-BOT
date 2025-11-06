const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "marry",
    aliases: ["waifu"],
    version: "4.0",
    author: "AceGun + Ncs Pro + A Dil",
    countDown: 5,
    role: 0,
    shortDescription: "Auto pair male with female (smart detect + mentions)",
    longDescription: "Marry someone or auto-pair a soulmate with gender-based logic ❤️",
    category: "love",
    guide: "{pn} [@mention1] [@mention2 | auto]"
  },

  onStart: async function ({ message, event, api, usersData }) {
    const mention = Object.keys(event.mentions);
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();
    const threadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = threadInfo.userInfo;

    let one, two; // one = male, two = female

    // 🧩 Get gender of a user
    const getGender = (uid) => {
      const user = allUsers.find(u => u.id === uid);
      return user ? user.gender : "UNKNOWN";
    };

    // 🧠 Case 1: Two mentions
    if (mention.length === 2) {
      const userA = mention[0];
      const userB = mention[1];

      const genderA = getGender(userA);
      const genderB = getGender(userB);

      if (genderA === "MALE" && genderB === "FEMALE") {
        one = userA;
        two = userB;
      } else if (genderA === "FEMALE" && genderB === "MALE") {
        one = userB;
        two = userA;
      } else {
        one = userA;
        two = userB;
      }
    }

    // 🧠 Case 2: One mention
    else if (mention.length === 1) {
      const user1 = senderID;
      const user2 = mention[0];

      const gender1 = getGender(user1);
      const gender2 = getGender(user2);

      if (gender1 === "MALE" && gender2 === "FEMALE") {
        one = user1;
        two = user2;
      } else if (gender1 === "FEMALE" && gender2 === "MALE") {
        one = user2;
        two = user1;
      } else {
        one = user1;
        two = user2;
      }
    }

    // 🧠 Case 3: No mention — auto pair
    else {
      const senderGender = getGender(senderID);
      let candidates = [];

      if (senderGender === "MALE") {
        for (let u of allUsers) {
          if (u.gender === "FEMALE" && u.id !== senderID && u.id !== botID)
            candidates.push(u.id);
        }
      } else if (senderGender === "FEMALE") {
        for (let u of allUsers) {
          if (u.gender === "MALE" && u.id !== senderID && u.id !== botID)
            candidates.push(u.id);
        }
      } else {
        for (let u of allUsers) {
          if (u.id !== senderID && u.id !== botID)
            candidates.push(u.id);
        }
      }

      if (candidates.length === 0)
        return message.reply("😢 No suitable partner found in this group!");

      two = candidates[Math.floor(Math.random() * candidates.length)];

      const gender2 = getGender(two);
      if (senderGender === "MALE" && gender2 === "FEMALE") {
        one = senderID;
      } else if (senderGender === "FEMALE" && gender2 === "MALE") {
        one = two;
        two = senderID;
      } else {
        one = senderID;
      }
    }

    // 🧡 Names
    const name1 = await usersData.getName(one);
    const name2 = await usersData.getName(two);

    // 💞 Image
    const imagePath = await createMarryImage(one, two);

    // 💫 Fancy text
    const emojis = ["💘", "💞", "💖", "💝", "💕", "💓", "💗", "💍", "💫", "🌹"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const chance = Math.floor(Math.random() * 100) + 1;

    const msg = `💒 ${randomEmoji} 𝑴𝒂𝒓𝒓𝒊𝒂𝒈𝒆 𝑪𝒆𝒓𝒆𝒎𝒐𝒏𝒚 ${randomEmoji}\n━━━━━━━━━━━━━━━\n💍 ${name1} 💞 ${name2}\n💘 𝑳𝒐𝒗𝒆 𝑪𝒐𝒎𝒑𝒂𝒕𝒊𝒃𝒊𝒍𝒊𝒕𝒚: ${chance}% 💫\n━━━━━━━━━━━━━━━\n👰 Congratulations, a new couple is born!`;

    return message.reply({
      body: msg,
      mentions: [{ tag: name2, id: two }],
      attachment: fs.createReadStream(imagePath)
    }, () => fs.unlinkSync(imagePath));
  }
};

// ❤️ Function to create marriage image
async function createMarryImage(one, two) {
  const avOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const avTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  
  avOne.circle();
  avTwo.circle();

  const marryTemplates = [
    "https://i.postimg.cc/26f9zkTc/marry.png"
  ];
  const randomTemplate = marryTemplates[Math.floor(Math.random() * marryTemplates.length)];

  const marryTemplate = await jimp.read(randomTemplate);
  marryTemplate.resize(432, 280)
    .composite(avOne.resize(60, 60), 189, 15)
    .composite(avTwo.resize(60, 60), 122, 25);

  const outputPath = __dirname + "/cache/marry.png";
  await marryTemplate.writeAsync(outputPath);
  return outputPath;
}
