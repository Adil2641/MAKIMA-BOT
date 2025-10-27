const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

const CACHE_FOLDER = path.join(__dirname, "cache");

async function downloadVideo(videoId, filePath) {
    const url = `https://adil-api.onrender.com/yt/v-dl?url=https://www.youtube.com/watch?v=${videoId}`;
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

async function fetchVideoFromReply(api, event, message) {
    const attachment = event.messageReply.attachments[0];
    if (!attachment || (attachment.type !== "video" && attachment.type !== "audio")) {
        throw new Error("Please reply to a valid video or audio attachment.");
    }

    const shortUrl = attachment.url;
    const reconApi = `https://adil-api.onrender.com/yt/v-i?url=${encodeURIComponent(shortUrl)}`;

    const videoRecResponse = await axios.get(reconApi);
    return {
        title: videoRecResponse.data.title,
        videoId: null
    };
}

async function fetchVideoFromQuery(query) {
    const searchResults = await ytSearch(query);
    if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
        return {
            title: searchResults.videos[0].title,
            videoId: searchResults.videos[0].videoId
        };
    } else {
        throw new Error("No results found for the given query.");
    }
}

async function handleVideoCommand(api, event, args, message) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
        let result;
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            result = await fetchVideoFromReply(api, event, message);
            // If we got title from reply, now search YouTube for that title
            const searchData = await fetchVideoFromQuery(result.title);
            result.videoId = searchData.videoId;
            result.title = searchData.title; // Use the YouTube title instead
        } else if (args.length > 0) {
            const query = args.join(" ");
            result = await fetchVideoFromQuery(query);
        } else {
            message.reply("Please provide a query or reply to a valid video/audio attachment.");
            return;
        }

        const filePath = path.join(CACHE_FOLDER, `${result.videoId}.mp4`);
        await downloadVideo(result.videoId, filePath);

        const videoStream = fs.createReadStream(filePath);
        message.reply({ 
            body: `•𝐓𝐢𝐭𝐥𝐞🏷️:🎥 ${result.title}`,
            attachment: videoStream 
        });
        api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
        console.error("Error:", error.message);
        message.reply("An error occurred while processing your request.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
}

module.exports = {
    config: {
        name: "video",
        version: "1.0",
        author: "ADIL",
        countDown: 10,
        role: 0,
        shortDescription: "Download and send video from YouTube.",
        longDescription: "Download video from YouTube based on a query or attachment.",
        category: "video",
        guide: "{p}video [query] or reply to a video/audio attachment",
    },
    onStart: function ({ api, event, args, message }) {
        return handleVideoCommand(api, event, args, message);
    },
};
