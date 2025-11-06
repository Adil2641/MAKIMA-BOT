const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "manage",
    aliases: ['mg', 'accept', 'pending'],
    version: "2.1",
    author: "JV Barcenas & GoatBot Team (Combined & Improved by A.Dil)",
    countDown: 8,
    role: 2,
    shortDescription: "Manage friend requests and pending group approvals",
    longDescription: "A single command that lets you accept/delete Facebook friend requests and approve/cancel pending group requests.",
    category: "Utility",
    guide: {
      en: `📘 **Usage Guide:**
      
Use this command to manage both *friend requests* and *pending group invitations*.

🧑‍🤝‍🧑 **Friend Requests**
→ {pn} friend  
Then reply with:
  • add all — Accept all requests  
  • add <number> — Accept a specific one  
  • del all — Delete all requests  
  • del <number> — Delete a specific one

👥 **Pending Groups**
→ {pn} pending  
Then reply with:
  • 1 2 3 — Approve those groups  
  • c1 or cancel 2 — Refuse those groups

💡 Example:
  {pn} friend
  (then reply) add all

  {pn} pending
  (then reply) cancel 1`
    }
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "Refused %1 thread(s)!",
      approveSuccess: "Approved successfully %1 thread(s)!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending: "»「PENDING」«❮ Total pending threads: %1 ❯\n\n%2",
      returnListClean: "「PENDING」There is no thread in the pending list"
    }
  },

  onReply: async function ({ message, Reply, event, api, getLang, commandName }) {
    const { author, type, listRequest, pending, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.trim().split(/\s+/);
    clearTimeout(Reply.unsendTimeout);

    // ======== FRIEND REQUEST SECTION ======== //
    if (type === "friend") {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        variables: {
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3,
          refresh_num: 0
        }
      };

      const success = [];
      const failed = [];

      if (args[0] === "add") {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
        form.doc_id = "3147613905362928";
      } else if (args[0] === "del") {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
        form.doc_id = "4108254489275063";
      } else {
        return api.sendMessage("Please select <add | del> <number | all>", event.threadID, event.messageID);
      }

      let targetIDs = args.slice(1);
      if (args[1] === "all") {
        targetIDs = listRequest.map((_, i) => i + 1);
      }

      const newTargetIDs = [];
      const promiseFriends = [];

      for (const stt of targetIDs) {
        const u = listRequest[parseInt(stt) - 1];
        if (!u) {
          failed.push(`Can't find #${stt} in the list`);
          continue;
        }
        form.variables.input.friend_requester_id = u.node.id;
        form.variables = JSON.stringify(form.variables);
        newTargetIDs.push(u);
        promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
        form.variables = JSON.parse(form.variables);
      }

      for (let i = 0; i < newTargetIDs.length; i++) {
        try {
          const res = await promiseFriends[i];
          if (JSON.parse(res).errors) failed.push(newTargetIDs[i].node.name);
          else success.push(newTargetIDs[i].node.name);
        } catch {
          failed.push(newTargetIDs[i].node.name);
        }
      }

      return api.sendMessage(
        `✅ ${args[0] === 'add' ? 'Accepted' : 'Deleted'} ${success.length} friend request(s):\n${success.join("\n")}${failed.length ? `\n❌ Failed (${failed.length}):\n${failed.join("\n")}` : ""}`,
        event.threadID,
        event.messageID
      );
    }

    // ======== PENDING THREAD SECTION ======== //
    if (type === "pending") {
      const body = event.body.trim();
      let count = 0;

      if (body.startsWith("c") || body.startsWith("cancel")) {
        const index = body.slice(1).trim().split(/\s+/);
        for (const singleIndex of index) {
          if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > pending.length)
            return api.sendMessage(getLang("invaildNumber", singleIndex), event.threadID, event.messageID);

          api.removeUserFromGroup(api.getCurrentUserID(), pending[singleIndex - 1].threadID);
          count++;
        }
        return api.sendMessage(getLang("cancelSuccess", count), event.threadID, messageID);
      } else {
        const index = body.split(/\s+/);
        for (const singleIndex of index) {
          if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > pending.length)
            return api.sendMessage(getLang("invaildNumber", singleIndex), event.threadID, event.messageID);

          api.sendMessage(`𝕋𝕙𝕒𝕟𝕜𝕤 𝕗𝕠𝕣 𝕒𝕕𝕕 𝕞𝕖🙂. 𝕄𝕪 ℙ𝕣𝕖𝕗𝕚𝕩 𝕚𝕤 +`, pending[singleIndex - 1].threadID);
          count++;
        }
        return api.sendMessage(getLang("approveSuccess", count), event.threadID, event.messageID);
      }
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    const args = event.body?.split(/\s+/) || [];

    // If user types “manage friend” → show friend requests
    if (args.includes("friend")) {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const res = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form));
      const listRequest = res.data.viewer.friending_possibilities.edges;

      if (!listRequest.length)
        return api.sendMessage("No pending friend requests found.", threadID, messageID);

      let msg = "👥 Pending Friend Requests:\n";
      listRequest.forEach((user, i) => {
        msg += `\n${i + 1}. ${user.node.name}\nID: ${user.node.id}\nURL: ${user.node.url.replace("www.facebook", "fb")}\nTime: ${moment(user.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      return api.sendMessage(`${msg}\n\nReply: <add|del> <number|all>`, threadID, (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          type: "friend",
          unsendTimeout: setTimeout(() => api.unsendMessage(info.messageID), 8000)
        });
      }, messageID);
    }

    // If user types “manage pending” → show pending threads
    else if (args.includes("pending")) {
      try {
        const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
        const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
        const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

        if (!list.length)
          return api.sendMessage(getLang("returnListClean"), threadID, messageID);

        let msg = "";
        list.forEach((g, i) => (msg += `${i + 1}/ ${g.name} (${g.threadID})\n`));

        return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list,
            type: "pending"
          });
        }, messageID);
      } catch (e) {
        return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
      }
    }

    // Default help if no argument provided
    else {
      return api.sendMessage(
        "📋 Usage:\n\n1️⃣ To manage friends:\n→ manage friend\n\n2️⃣ To manage pending groups:\n→ manage pending",
        threadID,
        messageID
      );
    }
  }
};
