const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "slap",
    version: "1.2",
    author: "NTKhang & A Dil Edit",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Create a slap meme with your friend!",
    category: "image",
    guide: {
      en: "{pn} @tag or reply to someone's message"
    }
  },

  langs: {
    vi: {
      noTarget: "Bạn phải tag hoặc reply người bạn muốn tát"
    },
    en: {
      noTarget: "You must tag or reply to the person you want to slap"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const senderID = event.senderID;
    let targetID;

    // --- Check if user replied to someone ---
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    // --- Or check if user mentioned someone ---
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    // --- If no target found, show message ---
    if (!targetID) {
      return message.reply(getLang("noTarget"));
    }

    try {
      // --- Get avatars ---
      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      // --- Generate slap image ---
      const img = await new DIG.Batslap().getImage(avatar1, avatar2);

      // --- Save image temporarily ---
      const pathSave = `${__dirname}/tmp/${senderID}_${targetID}_slap.png`;
      await fs.writeFile(pathSave, Buffer.from(img));

      const content = args.join(" ").replace(Object.keys(event.mentions)[0] || "", "");
      const body = content || "👋 Bopppp 😵‍💫😵";

      // --- Send message ---
      await message.reply({
        body,
        attachment: fs.createReadStream(pathSave)
      });

      // --- Clean up ---
      fs.unlinkSync(pathSave);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to create slap image!");
    }
  }
};
