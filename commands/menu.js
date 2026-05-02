async function handle({ sock, from }) {
  const menu = `╔════════════════════╗
║   BOTIFY X v1.0.3  ║
╚════════════════════╝

━━━━━ 👥 GROUP ━━━━━
*antilink on/off
*promote
*demote
*kick
*resetlink
*welcome on/off
*goodbye on/off
*tagall
*hidetag [message]
*warn

━━━━━ 🛠️ UTILITY ━━━━━
*vv
*getpp
*sticker

━━━━━ 👑 OWNER ━━━━━
*ping
*mode public/private

━━━━━ 🔧 OTHER ━━━━━
*anticall on/off
*antidelete on/off
*antiedit on/off
*menu

━━━━━ 🔕 SECRET ━━━━━
Reply to view-once with emojis → saved secretly

━━━━━━━━━━━━━━━━━━━━
Powered by BOTIFY X`;

  await sock.sendMessage(from, { text: menu });
}

module.exports = { handle };
