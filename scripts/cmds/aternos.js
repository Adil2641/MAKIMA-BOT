const axios = require("axios");

const targetGroupID = "9592689374193856"; // Replace with your group ID

let lastStatus = null;
let monitorInterval = null;
let isMonitoring = false;
let lastMessageID = null;

async function checkAternos(api, forceSend = false) {
  try {
    const response = await axios.get("https://aterbot-adil.onrender.com//status");
    const data = response.data;

    const newStatus = `${data.status}-${data.version}`;

    if (forceSend || newStatus !== lastStatus) {
      lastStatus = newStatus;

      const message = `🌍⛏️𝐌𝐢𝐧𝐞𝐜𝐫𝐚𝐟𝐭 𝐒𝐞𝐫𝐯𝐞𝐫 𝐈𝐧𝐟𝐨ℹ️:
🌐 𝐈𝐏: true-fighter.aternos.me
🔌 𝐏𝐨𝐫𝐭: 22518   
📊 𝐀𝐭𝐞𝐫𝐧𝐨𝐬 𝐒𝐭𝐚𝐭𝐮𝐬: ${data.status}
📦 𝐒𝐞𝐫𝐯𝐞𝐫 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${data.version}
📝 𝐒𝐞𝐫𝐯𝐞𝐫 𝐌𝐨𝐫𝐞 𝐃𝐞𝐭𝐚𝐢𝐥𝐬: 📌Server is now available on Bedrock and Java both ✅
🔗 𝐀𝐏𝐊 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐥𝐢𝐧𝐤: https://mcpedl.org/uploads_files/14-05-2025/minecraft-1-21-81.apk`;

      if (lastMessageID) {
        try {
          await api.unsendMessage(lastMessageID);
        } catch (err) {
          console.warn("[Aternos] Failed to unsend previous message:", err.message);
        }
      }

      api.sendMessage(message, targetGroupID, (err, info) => {
        if (!err && info?.messageID) {
          lastMessageID = info.messageID;
        }
      });
    } else {
      console.log("[Aternos] No change in status/version, no message sent.");
    }
  } catch (err) {
    console.error("[Aternos Monitor] Error fetching API:", err.message);
    // Send error message to the group chat
    const errorMsg = `⚠️ Aternos API Monitor Error:\n${err.message}`;
    api.sendMessage(errorMsg, targetGroupID);
  }
}

module.exports = {
  config: {
    name: "aternos",
    version: "2.6",
    author: "AutoGPT + Enhanced",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Toggle Aternos API monitoring" },
    longDescription: {
      en: "Monitors Aternos API every 30 seconds and sends updates only when the status or version changes. Automatically removes old messages when sending new ones. You can also get instant updates by sending 'aternos' without a prefix."
    },
    category: "utility",
    guide: {
      en: "`aternos on` — start monitoring\n`aternos off` — stop monitoring\nSay `aternos` alone to get current status"
    }
  },

  onStart: async function ({ message, args, api }) {
    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "on") {
      if (isMonitoring) return message.reply("✅ Monitoring is already active.");
      isMonitoring = true;
      message.reply("🟢 Aternos monitoring started.");

      await checkAternos(api);

      monitorInterval = setInterval(() => checkAternos(api), 30 * 1000);
    } else if (subCommand === "off") {
      if (!isMonitoring) return message.reply("⚠️ Monitoring is not running.");
      clearInterval(monitorInterval);
      monitorInterval = null;
      isMonitoring = false;

      if (lastMessageID) {
        try {
          await api.unsendMessage(lastMessageID);
        } catch (err) {
          console.warn("[Aternos] Could not unsend on stop:", err.message);
        }
        lastMessageID = null;
      }

      message.reply("🔴 Aternos monitoring stopped.");
    } else {
      message.reply("⚙️ Use:\n• `aternos on` to start\n• `aternos off` to stop\n• Say `aternos` alone to get current status");
    }
  },

  onChat: async function({ event, api }) {
    const msg = event.body?.toLowerCase();
    if (msg === "aternos") {
      await checkAternos(api, true);
    }
  }
};
