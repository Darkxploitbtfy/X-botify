async function handle({ sock, from, msg }) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctx || !ctx.quotedMessage) {
    return sock.sendMessage(from, { text: '❌ Reply to a view-once message to reveal it.' });
  }

  const quotedMsg = ctx.quotedMessage;
  const voMsg =
    quotedMsg.viewOnceMessage?.message ||
    quotedMsg.viewOnceMessageV2?.message ||
    quotedMsg.viewOnceMessageV2Extension?.message ||
    quotedMsg;

  const imageMsg = voMsg?.imageMessage;
  const videoMsg = voMsg?.videoMessage;

  try {
    if (imageMsg) {
      const buffer = await sock.downloadMediaMessage({ message: voMsg, key: msg.key });
      await sock.sendMessage(from, {
        image: buffer,
        caption: '👁️ View-once image revealed by BOTIFY X'
      });
    } else if (videoMsg) {
      const buffer = await sock.downloadMediaMessage({ message: voMsg, key: msg.key });
      await sock.sendMessage(from, {
        video: buffer,
        caption: '👁️ View-once video revealed by BOTIFY X'
      });
    } else {
      await sock.sendMessage(from, { text: '❌ Could not find a view-once message to reveal.' });
    }
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Failed to reveal view-once message.' });
  }
}

async function handleSecret(sock, msg, adminJid) {
  if (!adminJid) return;

  const voMsg =
    msg.message?.viewOnceMessage?.message ||
    msg.message?.viewOnceMessageV2?.message ||
    msg.message?.viewOnceMessageV2Extension?.message;

  if (!voMsg) return;

  try {
    const imageMsg = voMsg.imageMessage;
    const videoMsg = voMsg.videoMessage;

    if (imageMsg) {
      const buffer = await sock.downloadMediaMessage({ message: voMsg, key: msg.key });
      await sock.sendMessage(adminJid, {
        image: buffer,
        caption: '🔕 *Secret view-once saved*\n\nSomeone tried to send this view-once.'
      });
    } else if (videoMsg) {
      const buffer = await sock.downloadMediaMessage({ message: voMsg, key: msg.key });
      await sock.sendMessage(adminJid, {
        video: buffer,
        caption: '🔕 *Secret view-once saved*\n\nSomeone tried to send this view-once.'
      });
    }
  } catch (err) {
    console.error('[VV Secret Error]', err.message);
  }
}

module.exports = { handle, handleSecret };
