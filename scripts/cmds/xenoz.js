const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function animeSong(api, event, args, message) {
    api.setMessageReaction("🕢", event.messageID, () => {}, true);

    try {
        // Step 1: Get random video URL from Xenoz channel API
        const animeSongResponse = await axios.get("https://xenoz-yt.vercel.app/channel");
        const videoUrl = animeSongResponse.data.videoUrl;

        // Step 2: Get download details from your Dipto API
        const { data: { title, quality, downloadLink } } = await axios.get(`${global.apis.diptoApi}/ytDl3?link=${encodeURIComponent(videoUrl)}&format=mp4`);

        if (!downloadLink) {
            return message.reply("❌ Failed to get download link.");
        }

        // Step 3: Shorten download URL
        const o = ".php";
        const shortUrl = (await axios.get(`https://tinyurl.com/api-create${o}?url=${encodeURIComponent(downloadLink)}`)).data;

        // Step 4: Download the video temporarily
        const filePath = path.join(__dirname, "cache", "xenoz.mp4");
        const response = await axios({
            url: downloadLink,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
            const videoStream = fs.createReadStream(filePath);

            // Step 5: Send the video in chat
            await message.reply({
                body: `🎧 𝗧𝗶𝘁𝗹𝗲: ${title}\n✨ 𝗤𝘂𝗮𝗹𝗶𝘁𝘆: ${quality}\n📥 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱: ${shortUrl}`,
                attachment: videoStream
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            // Delete file after sending
            fs.unlinkSync(filePath);
        });

        writer.on("error", (error) => {
            console.error("Writer Error:", error);
            message.reply("Error occurred while saving the video.");
        });

    } catch (error) {
        console.error("Main Error:", error);
        message.reply("❌ An error occurred while processing your request.");
    }
}

module.exports = {
    config: {
        name: "xenoz",
        aliases: [],
        version: "1.1",
        author: "Modified by Adil",
        countDown: 10,
        role: 0,
        shortDescription: "Random anime song using Dipto API",
        longDescription: "Fetches a random anime video from Xenoz channel using Dipto YouTube API.",
        category: "music",
        guide: "{p}xenoz"
    },
    onStart: function ({ api, event, args, message }) {
        return animeSong(api, event, args, message);
    }
};
