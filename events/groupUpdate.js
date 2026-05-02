const { getGroupSettings } = require('../utils/dataManager');

async function handleGroupUpdate(sock, events) {
  for (const event of events) {
    try {
      const groupId = event.id;
      const settings = getGroupSettings(groupId);

      if (event.action === 'add') {
        if (settings.welcome) {
          const participants = event.participants || [];
          for (const jid of participants) {
            const phone = jid.split('@')[0];
            await sock.sendMessage(groupId, {
              text: `👋 Welcome @${phone} to the group!\nWe're happy to have you here. 🎉`,
              mentions: [jid]
            });
          }
        }
      } else if (event.action === 'remove') {
        if (settings.goodbye) {
          const participants = event.participants || [];
          for (const jid of participants) {
            const phone = jid.split('@')[0];
            await sock.sendMessage(groupId, {
              text: `👋 Goodbye @${phone}! We'll miss you.`,
              mentions: [jid]
            });
          }
        }
      }
    } catch (err) {
      console.error('[GroupUpdate Error]', err.message);
    }
  }
}

module.exports = { handleGroupUpdate };
