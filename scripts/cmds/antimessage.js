const activeThreads = new Map();

module.exports = {
  config: {
    name: "antimessage",
    version: "2.3", 
    author: "A Dil + DeepSeek",
    countDown: 5,
    role: 1,
    shortDescription: "Anti message deletion",
    longDescription: "Resends deleted messages and attachments",
    category: "box chat",
    guide: "{p}antimessage [on/off]"
  },

  onStart: function({ message, event, args }) {
    const { threadID } = event;

    if (args[0] === "on") {
      activeThreads.set(threadID, new Map());
      message.reply("✅ Anti-message ENABLED!");
    } 
    else if (args[0] === "off") {
      activeThreads.delete(threadID);
      message.reply("❌ Anti-message DISABLED!");
    }
    else {
      const status = activeThreads.has(threadID) ? "ON" : "OFF";
      message.reply(`Status: ${status}`);
    }
  },

  onChat: async function({ event, api }) {
    try {
      const { type, threadID, messageID, body, senderID, attachments } = event;
      
      if (type === "message" && body || attachments) {
        // Store messages (with or without attachments)
        if (activeThreads.has(threadID) && senderID !== api.getCurrentUserID()) {
          const threadMsgs = activeThreads.get(threadID);
          threadMsgs.set(messageID, { 
            body: body || "", 
            senderID: senderID,
            attachments: attachments || []
          });
        }
      }
      else if (type === "message_unsend") {
        // Handle message deletion
        if (activeThreads.has(threadID)) {
          const threadMsgs = activeThreads.get(threadID);
          const deletedMsg = threadMsgs.get(messageID);
          
          if (deletedMsg) {
            const { body, senderID, attachments } = deletedMsg;
            let name = "Someone";
            
            try {
              const userInfo = await api.getUserInfo(senderID);
              name = userInfo[senderID]?.name || "Someone";
            } catch (e) {}
            
            // Prepare attachments
            const attachmentStreams = [];
            if (attachments && attachments.length > 0) {
              for (const attachment of attachments) {
                try {
                  const stream = await global.utils.getStreamFromURL(attachment.url);
                  attachmentStreams.push(stream);
                } catch (error) {
                  console.error("Error getting attachment stream:", error);
                }
              }
            }
            
            // Send everything in one message
            if (attachmentStreams.length > 0) {
              // With attachments
              await api.sendMessage({
                body: body ? `🗑️ ${name} kire ki delete dili 🐸 ata naki 😏:\n\n"${body}"` : `🗑️ ${name} kire ki delete dili🐸 ata naki😏:`,
                attachment: attachmentStreams
              }, threadID);
            } else {
              // Text only
              await api.sendMessage(
                `🗑️ ${name} kire ki delete dili 🐸 ata naki 😏:\n\n"${body}"`,
                threadID
              );
            }
            
            console.log(`Resent deleted content from ${name}`);
            threadMsgs.delete(messageID);
          }
        }
      }
    } catch (error) {
      console.error("Anti-message error:", error);
    }
  }
};