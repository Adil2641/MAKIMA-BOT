const apiUrl = "https://www.noobs-apis.run.place";

module.exports = {
  config: {
  name: "upscale",
  aliases: ["4k", "ups"],
  version: "1.6.9",
  author: "Nazrul",
  role: 0,
  description: "Upscale image by URL or reply",
  category: "image",
  countDown: 9,
  guide: { en: "{pn} [url] or reply to image" }
  },

  onStart: async ({ message, event, args }) => {
 const s = Date.now();
let imgUrl; if (event.messageReply?.attachments?.[0]?.type === "photo") { imgUrl = event.messageReply.attachments[0].url } else if (args[0]) { imgUrl = args.join(" ")}

  if (!imgUrl) {
      return message.reply("• Reply to image or provide imgUrl!");
    }
  message.reaction('🦆', event.messageID);
    try {
      const res = await require('axios').get(`${apiUrl}/nazrul/upscale?imgUrl=${encodeURIComponent(imgUrl)}`, { responseType: "stream" });
  message.reaction('✅', event.messageID);
  const t = ((Date.now() - s) / 1000).toFixed(2);
  message.reply({ body: `✅ Here's your Upscaled Image!\n⌛ Process time : ${t} `, attachment: res.data });
    } catch (error) {
      message.reaction('❌', event.messageID);
      message.reply(`error: ${error.message}`);
    }
  }
};