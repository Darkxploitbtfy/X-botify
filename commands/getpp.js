async function handle({ sock, from, msg }) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  let target = ctx?.participant || null;

  if (!target) {
    const mentioned = ctx?.mentionedJid;
    target = mentioned?.[0] || null;
  }

  if (!target) return sock.sendMessage(from, { text: '❌ Reply to a user or mention them.\nUsage: *getpp (reply or @mention)' });

  try {
    const ppUrl = await sock.profilePictureUrl(target, 'image');
    const response = await fetch(ppUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sock.sendMessage(from, {
      image: buffer,
      caption: `🖼️ Profile picture of @${target.split('@')[0]}`,
      mentions: [target]
    });
  } catch (err) {
    await sock.sendMessage(from, {
      text: `❌ Could not fetch profile picture for @${target.split('@')[0]}. They may have privacy settings enabled.`,
      mentions: [target]
    });
  }
}

module.exports = { handle };
