const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs")


module.exports = {
    config: {
        name: "pair4",
        aliases: [],
        version: "1.0",
        author: "AceGun",
        countDown: 5,
        role: 0,
        shortDescription: "get a wife",
        longDescription: "",
        category: "love",
        guide: "{pn}"
    },



    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);
      if(mention.length == 0) return message.reply("Please mention someone");
else if(mention.length == 1){
const one = event.senderID, two = mention[0];
                bal(one, two).then(ptth => { message.reply({ body: "「 𝐋𝐨𝐯𝐞 𝐲𝐨𝐮 𝐁𝐛𝐞🥰❤ 」", attachment: fs.createReadStream(ptth) }) })
} else{
 const one = mention[1], two = mention[0];
            bal(one, two).then(ptth => { message.reply({ body: "「 𝐋𝐨𝐯𝐞 𝐲𝐨𝐮 𝐁𝐛𝐞🥰❤ 」" , attachment: fs.createReadStream(ptth) }) })
}
    }


};

async function bal(one, two) {

    let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)
    avone.circle()
    let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)
    avtwo.circle()
    let pth = "pair4.png"
    let img = await jimp.read("https://i.postimg.cc/wjJ29HRB/background1.png")

    img.resize(432, 280).composite(avone.resize(125, 125), 10, 80).composite(avtwo.resize(125, 125), 290, 80);

    await img.writeAsync(pth)
    return pth
}