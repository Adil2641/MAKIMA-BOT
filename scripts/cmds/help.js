const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.4",
    author: "A Dil ✨ (with NTKhang)",
    countDown: 5,
    role: 0,
    category: "info",
    description: {
      en: "💎 View all commands and usage",
      vi: "💎 Xem danh sách lệnh và cách sử dụng"
    },
    guide: {
      en: "{pn} [page | command name]",
      vi: "{pn} [trang | tên lệnh]"
    }
  },

  langs: {
    en: {
      header: "╭─❍━━━━━❍─╮\n│ 💫 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 💫 │\n╰─❍━━━━━❍─╯",
      footer: "╭─❍━━━━━❍─╮\n│ 🦋 𝗠𝗔𝗞𝗜𝗠𝗔 𝗕𝗢𝗧 🦋 │\n╰─❍━━━━━❍─╯",
      help:
        "📜 Page %1/%2 • %3 Commands\n\n%4\n\n💡 Type: %5help <command> for details",
      helpAll:
        "📂 Showing all commands by category (%1 total)\n\n%2\n\n💡 Type: %3help <command> for details",
      commandInfo:
        "╭─💠 Command Info ────────╮\n" +
        "🌸 Name: %1\n" +
        "🪞 Description: %2\n" +
        "🧩 Aliases: %3\n" +
        "📂 Category: %4\n" +
        "🛡️ Role: %5\n" +
        "⏳ Cooldown: %6s\n" +
        "👑 Author: %7\n" +
        "╰────────────────────╯\n\n" +
        "💬 Usage:\n%8",
      notFound: "❌ Command \"%1\" not found.",
      role0: "Everyone 🌍",
      role1: "Group Admins 🛡️",
      role2: "Bot Admins 👑"
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const langCode = await threadsData.get(event.threadID, "data.lang") || "en";
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const lang = this.langs[langCode] || this.langs.en;

    const page = parseInt(args[0]) || 1;
    const cmdName = (args[0] || "").toLowerCase();
    const command = commands.get(cmdName) || commands.get(aliases.get(cmdName));

    // 🌟 Command Info
    if (command) {
      const conf = command.config;
      const roleText =
        conf.role == 0 ? lang.role0 : conf.role == 1 ? lang.role1 : lang.role2;
      const guideText =
        typeof conf.guide === "object"
          ? conf.guide[langCode] || conf.guide.en
          : conf.guide || "";
      const desc =
        typeof conf.description === "object"
          ? conf.description[langCode] || conf.description.en
          : conf.description;

      return message.reply(
        lang.commandInfo
          .replace("%1", conf.name)
          .replace("%2", desc || "No description.")
          .replace("%3", conf.aliases ? conf.aliases.join(", ") : "None")
          .replace("%4", conf.category || "Uncategorized")
          .replace("%5", roleText)
          .replace("%6", conf.countDown || 0)
          .replace("%7", conf.author || "Unknown")
          .replace("%8", guideText.replace(/{pn}/g, prefix + conf.name))
      );
    }

    // 🧩 Get sorting preference
    const sortType =
      (await threadsData.get(threadID, "settings.sortHelp")) || "name";

    const cmds = [...commands.values()].filter(
      (cmd) => cmd.config.role <= role
    );

    // 🗂️ Category sorting (all commands)
    if (sortType === "category") {
      cmds.sort((a, b) => {
        if (a.config.category === b.config.category)
          return a.config.name.localeCompare(b.config.name);
        return (a.config.category || "").localeCompare(b.config.category || "");
      });

      let grouped = "";
      let currentCat = "";

      for (const c of cmds) {
        const cat = c.config.category || "Uncategorized";
        if (cat !== currentCat) {
          currentCat = cat;
          // Bold category names
          grouped += `\n📂 **${currentCat.toUpperCase()}**\n`;
        }
        grouped += `  💠 ${c.config.name} — ${
          typeof c.config.description === "object"
            ? c.config.description.en || "No description"
            : c.config.description || "No description"
        }\n`;
      }

      const msg = `${lang.header}\n\n${lang.helpAll
        .replace("%1", cmds.length)
        .replace("%2", grouped.trim())
        .replace("%3", prefix)}\n\n${lang.footer}`;
      return message.reply(msg);
    }

    // 🔠 Default: sort by name (paged)
    cmds.sort((a, b) => a.config.name.localeCompare(b.config.name));

    const perPage = 12;
    const totalPages = Math.ceil(cmds.length / perPage);
    if (page < 1 || page > totalPages)
      return message.reply(`⚠️ Page ${page} does not exist.`);

    const pageCmds = cmds.slice((page - 1) * perPage, page * perPage);
    const list = pageCmds
      .map(
        (c, i) =>
          `💠 ${i + 1 + (page - 1) * perPage}. ${c.config.name} — ${
            typeof c.config.description === "object"
              ? c.config.description.en || "No description"
              : c.config.description || "No description"
          }`
      )
      .join("\n");

    const msg = `${lang.header}\n\n${lang.help
      .replace("%1", page)
      .replace("%2", totalPages)
      .replace("%3", cmds.length)
      .replace("%4", list)
      .replace("%5", prefix)}\n\n${lang.footer}`;

    return message.reply(msg);
  }
};
