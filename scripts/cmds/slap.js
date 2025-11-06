const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

// --- JSON file to store allowed users ---
const filePath = path.join(__dirname, "slapUsers.json");

// --- Load allowed users from file ---
let allowedUsers = [];
if (fs.existsSync(filePath)) {
  try {
    allowedUsers = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    allowedUsers = [];
  }
}

// --- Function to save allowed users ---
function saveAllowedUsers() {
  fs.writeFileSync(filePath, JSON.stringify(allowedUsers, null, 2));
}

// --- Slap status ---
const slapStatus = true; // always ON

module.exports = {
  config: {
    name: "slap",
    version: "2.2",
    author: "NTKhang & A Dil Edit",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Create a slap meme with your friend!",
    category: "image",
    guide: {
      en: "{pn} @tag or reply to someone's message | {pn} add/remove/list"
    }
  },

  langs: {
    vi: {
      noTarget: "Bạn phải tag hoặc reply người bạn muốn tát",
      unknown: "Người lạ = bạn là ai?",
      noPermission: "⚠️ Bạn không có quyền thực hiện thao tác này"
    },
    en: {
      noTarget: "You must tag or reply to the person you want to slap",
      unknown: "Tui ka re slap diyar 😒",
      noPermission: "⚠️ You do not have permission to do this"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const senderID = event.senderID;
    const sub = args[0]?.toLowerCase();

    // --- Handle admin commands only for allowed users ---
    if (["add", "remove"].includes(sub)) {
      if (!allowedUsers.includes(senderID)) {
        return message.reply(getLang("noPermission"));
      }
    }

    // --- ADD command (by mention, reply, or UID) ---
    if (sub === "add") {
      let uidToAdd = null;

      // --- By mention ---
      if (Object.keys(event.mentions).length > 0) {
        uidToAdd = Object.keys(event.mentions)[0];
      }
      // --- By reply ---
      else if (event.type === "message_reply") {
        uidToAdd = event.messageReply.senderID;
      }
      // --- By args[1] (UID) ---
      else if (args[1]) {
        uidToAdd = args[1];
      }

      if (!uidToAdd) return message.reply(getLang("noTarget"));

      if (!allowedUsers.includes(uidToAdd)) allowedUsers.push(uidToAdd);
      saveAllowedUsers();
      return message.reply(`✅ Added user ${uidToAdd} to allowed list.`);
    }

    // --- REMOVE command (by mention, reply, or UID) ---
    if (sub === "remove") {
      let uidToRemove = null;

      // --- By mention ---
      if (Object.keys(event.mentions).length > 0) {
        uidToRemove = Object.keys(event.mentions)[0];
      }
      // --- By reply ---
      else if (event.type === "message_reply") {
        uidToRemove = event.messageReply.senderID;
      }
      // --- By args[1] (UID) ---
      else if (args[1]) {
        uidToRemove = args[1];
      }

      if (!uidToRemove) return message.reply(getLang("noTarget"));

      allowedUsers = allowedUsers.filter(uid => uid !== uidToRemove);
      saveAllowedUsers();
      return message.reply(`❌ Removed user ${uidToRemove} from allowed list.`);
    }

    // --- LIST command ---
    if (sub === "list") {
      if (allowedUsers.length === 0) return message.reply("⚠️ Allowed user list is empty.");
      const namesList = await Promise.all(
        allowedUsers.map(async uid => {
          try {
            const name = await usersData.getName(uid);
            return `${name} (${uid})`;
          } catch {
            return `Unknown (${uid})`;
          }
        })
      );
      return message.reply(`📜 Allowed Users:\n${namesList.join("\n")}`);
    }

    // --- Determine target for slap ---
    let targetID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID) return message.reply(getLang("noTarget"));

    // --- Permission logic ---
    // Slap is always ON, but block allowed users as targets
    if (allowedUsers.includes(targetID)) return message.reply(getLang("unknown"));

    // --- Generate slap image ---
    try {
      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      const img = await new DIG.Batslap().getImage(avatar1, avatar2);

      const pathSave = path.join(__dirname, "tmp", `${senderID}_${targetID}_slap.png`);
      await fs.writeFile(pathSave, Buffer.from(img));

      const content = args.join(" ").replace(Object.keys(event.mentions)[0] || "", "");
      const body = content || "👋 Bopppp 😵‍💫😵";

      await message.reply({
        body,
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to create slap image!");
    }
  }
};
