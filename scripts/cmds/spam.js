const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "spam",
    version: "1.3",
    author: "Otineeeyyyyy (updated by GPT-5)",
    countDown: 5,
    role: 2,
    shortDescription: "Spam text or attachments",
    longDescription: "Spam a text message 100 times or a replied attachment 20 times. Use responsibly.",
    category: "fun",
    usage: {
      en: "{pn} <text> — spam the text 100 times\n{pn} (reply to attachment) — spam the attachment 20 times",
      vi: "{pn} <văn bản> — gửi lặp văn bản 100 lần\n{pn} (trả lời tệp đính kèm) — gửi lại tệp 20 lần"
    },
    guide: {
      en:
        "🌀 **Usage Examples:**\n" +
        "• {pn} hello world — sends 'hello world' 100 times\n" +
        "• (reply to a photo) {pn} — resends that photo 20 times\n\n" +
        "📘 **Notes:**\n" +
        "• Text spams 100× by default\n" +
        "• Replied attachments (photo/video/file) spam 20×\n" +
        "• You can adjust limits inside the code (TEXT_TIMES / ATTACH_TIMES)\n" +
        "• Please use responsibly!",
      vi:
        "🌀 **Cách dùng:**\n" +
        "• {pn} xin chào — gửi 'xin chào' 100 lần\n" +
        "• (trả lời ảnh) {pn} — gửi lại ảnh đó 20 lần\n\n" +
        "📘 **Lưu ý:**\n" +
        "• Văn bản gửi lặp 100 lần\n" +
        "• Ảnh/tệp đính kèm gửi lại 20 lần\n" +
        "• Có thể chỉnh số lần trong mã (TEXT_TIMES / ATTACH_TIMES)\n" +
        "• Sử dụng có trách nhiệm!"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    // --- Default Spam Counts ---
    const TEXT_TIMES = 100;
    const ATTACH_TIMES = 20;

    // Helper to safely send a message
    const safeSendText = async (text, tid) => {
      try {
        await api.sendMessage(text, tid);
      } catch (_) { /* ignore */ }
    };

    // --- If the command is replying to a message with attachments ---
    try {
      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attach = event.messageReply.attachments[0];
        const url = attach.url || attach.src || attach.attachment || attach.data || attach.previewUrl || null;

        if (!url) {
          return api.sendMessage("⚠️ Couldn't find a valid URL for the replied attachment.", threadID, messageID);
        }

        let ext = ".jpg";
        try {
          const pathname = new URL(url).pathname;
          ext = path.extname(pathname) || ext;
        } catch { /* keep default */ }

        const tmpFilename = path.join(process.cwd(), `tmp_spam_${Date.now()}${ext}`);

        // Try downloading attachment
        try {
          const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
          fs.writeFileSync(tmpFilename, Buffer.from(res.data, "binary"));
        } catch {
          // fallback if can't download
          for (let i = 0; i < ATTACH_TIMES; i++) await safeSendText(url, threadID);
          return;
        }

        // Send attachment multiple times
        for (let i = 0; i < ATTACH_TIMES; i++) {
          try {
            await api.sendMessage({ attachment: fs.createReadStream(tmpFilename) }, threadID);
          } catch {
            try {
              await api.sendMessage({ body: url }, threadID);
            } catch { /* ignore */ }
          }
        }

        // cleanup temp file
        try { fs.unlinkSync(tmpFilename); } catch { /* ignore */ }
        return;
      }
    } catch (err) {
      console.error("Attachment spam error:", err);
    }

    // --- Otherwise, spam text ---
    const message = args.join(" ").trim();
    if (!message)
      return api.sendMessage("💬 Please type the text you want to spam.", threadID, messageID);

    for (let i = 0; i < TEXT_TIMES; i++) {
      await safeSendText(message, threadID);
    }
  }
};
