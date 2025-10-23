const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

const CACHE_FOLDER = path.join(__dirname, "cache");

async function downloadAudio(videoUrl, filePath) {
    const url = `https://adil-api.onrender.com/yt/a-dl?url=${encodeURIComponent(videoUrl)}`;
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

async function fetchAudioFromReply(api, event, message) {
    const attachment = event.messageReply.attachments[0];
    if (!attachment || (attachment.type !== "video" && attachment.type !== "audio")) {
        throw new Error("Please reply to a valid video or audio attachment.");
    }

    const videoUrl = attachment.url;
    const infoApi = `https://adil-api.onrender.com/yt/v-i?url=${encodeURIComponent(videoUrl)}`;

    const response = await axios.get(infoApi);
    return {
        title: response.data.title || "Unknown Title",
        videoUrl: videoUrl
    };
}

async function fetchAudioFromQuery(query) {
    const searchResults = await ytSearch(query);
    if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
        return {
            title: searchResults.videos[0].title,
            videoUrl: searchResults.videos[0].url
        };
    } else {
        throw new Error("No results found for the given query.");
    }
}

async function handleAudioCommand(api, event, args, message) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);

    try {
        let result;
        const loadingMsg = await message.reply("🔍 Searching and downloading audio... Please wait...");
        
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            result = await fetchAudioFromReply(api, event, message);
        } else if (args.length > 0) {
            const query = args.join(" ");
            result = await fetchAudioFromQuery(query);
        } else {
            message.reply("Please provide a query or reply to a valid video/audio attachment.");
            return;
        }

        // Create cache folder if it doesn't exist
        if (!fs.existsSync(CACHE_FOLDER)) {
            fs.mkdirSync(CACHE_FOLDER);
        }

        const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
        const filePath = path.join(CACHE_FOLDER, fileName);
        
        // Update message to show downloading status
        await api.editMessage(`⬇️ Downloading: ${result.title}...`, loadingMsg.messageID);
        
        await downloadAudio(result.videoUrl, filePath);

        const audioStream = fs.createReadStream(filePath);
        await api.unsendMessage(loadingMsg.messageID); // Remove the loading message
        message.reply({ 
            body: `🎵 ${result.title}`,
            attachment: audioStream 
        });
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
        console.error("Error:", error.message);
        message.reply("An error occurred while processing your request.");
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
}

module.exports = {
    config: {
        name: "song",
        version: "1.0",
        author: "ADIL",
        countDown: 10,
        role: 0,
        shortDescription: "Download and send audio from YouTube.",
        longDescription: "Download audio from YouTube based on a query or attachment.",
        category: "music",
        guide: "{p}song [query] or reply to a video/audio attachment",
        envConfig: {
            noPrefix: true // Add this line to enable no-prefix option
        }
    },
    onStart: function ({ api, event, args, message }) {
        return handleAudioCommand(api, event, args, message);
    },
    onChat: function ({ api, event, args, message }) {
        // This will make the command work without prefix
        const body = (event.body || "").toLowerCase();
        if (body.startsWith("song ") || body === "song") {
            return handleAudioCommand(api, event, args.slice(1), message);
        }
    }
};
