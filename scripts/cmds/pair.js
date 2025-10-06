const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    aliases: ["pairr"],
    version: "1.1",
    author: "Ncs Pro",
    role: 0,
    countDown: 5,
    shortDescription: {
      en: "auto pair a person"
    },
    longDescription: {
      en: ""
    },
    category: "love",
    guide: {
      en: ""
    }
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    var id1 = event.senderID;
    var name1 = await usersData.getName(id1);
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;

    for (let c of all) {
      if (c.id == id1) var gender1 = c.gender;
    }

    const botID = api.getCurrentUserID();
    let ungvien = [];

    if (gender1 == "FEMALE") {
      for (let u of all) {
        if (u.gender == "MALE") {
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
        }
      }
    } else if (gender1 == "MALE") {
      for (let u of all) {
        if (u.gender == "FEMALE") {
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
        }
      }
    } else {
      for (let u of all) {
        if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    }

    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name2 = await usersData.getName(id2);

    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];
    var tile = djtme[Math.floor(Math.random() * djtme.length)];

    var background = [
      "https://i.postimg.cc/wjJ29HRB/background1.png",
      "https://i.postimg.cc/zf4Pnshv/background2.png",
      "https://i.postimg.cc/5tXRQ46D/background3.png",
    ];
    var rd = background[Math.floor(Math.random() * background.length)];

    let getAvtmot = (
      await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    let getAvthai = (
      await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let baseAvt2 = await loadImage(pathAvt2);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 100, 150, 300, 300);
    ctx.drawImage(baseAvt2, 900, 150, 300, 300);
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // 💞 Random Emojis and Decorations
    const emojis = ["💘", "💞", "💖", "💝", "💕", "💓", "💗", "🌸", "🌹", "✨", "😍", "🥰", "😻", "💫", "🔥"];
    const symbols = ["♡", "♥", "💟", "❣️", "★", "☆", "💎", "🎀", "🌷", "🌼"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

    const randomTextStyles = [
      `╰┈➤ ${randomEmoji} 𝑷𝒂𝒊𝒓 𝑹𝒆𝒔𝒖𝒍𝒕 ${randomEmoji}`,
      `✦ ${randomSymbol} ＬＯＶＥ ＭＡＴＣＨ ${randomSymbol} ✦`,
      `╚»★«╝ 💞 Soulmate Found 💞 ╚»★«╝`,
      `${randomEmoji} 𝐋𝐨𝐯𝐞 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 💘`,
    ];
    const randomTitle = randomTextStyles[Math.floor(Math.random() * randomTextStyles.length)];

    const messageText = `${randomTitle}\n━━━━━━━━━━━━━━━\n💫 𝘊𝘰𝘯𝘨𝘳𝘢𝘵𝘴 ${name1} 💕 𝘺𝘰𝘶 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘱𝘢𝘪𝘳𝘦𝘥 𝘸𝘪𝘵𝘩 ${name2}!\n💍 𝑪𝒉𝒂𝒏𝒄𝒆 𝒐𝒇 𝑳𝒐𝒗𝒆: ${tile}% ${randomEmoji}\n━━━━━━━━━━━━━━━\n${randomSymbol} 𝑯𝒆𝒂𝒓𝒕𝒔 𝒂𝒍𝒊𝒈𝒏 𝒊𝒏 𝒎𝒚𝒔𝒕𝒊𝒄 𝒘𝒂𝒚𝒔 ${randomSymbol}`;

    return api.sendMessage(
      {
        body: messageText,
        mentions: [
          {
            tag: `${name2}`,
            id: id2,
          },
        ],
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
