/**
 * BOTIFY X v1.0.3
 * WhatsApp Bot + Web Panel
 *
 * Web Panel: /panel (login, pairing, users)
 * WhatsApp Bot: commands via WhatsApp only
 */

const { createDashboard } = require('./dashboard/app');
const fs = require('fs');
const path = require('path');

// Ensure data and auth directories exist
['auth', 'data'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Ensure data files exist
const dataFiles = {
  'data/users.json': '[]',
  'data/settings.json': '{"botMode":"public","groups":{}}',
  'data/warnings.json': '{}'
};

for (const [file, defaultContent] of Object.entries(dataFiles)) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent);
  }
}

// Start web panel
const PORT = process.env.PORT || 3000;
const app = createDashboard();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  BOTIFY X v1.0.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Web Panel running on port ${PORT}
  🌐 Open: http://localhost:${PORT}/panel
  🔑 Login: katson / #jesusfuckingchrist#
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Waiting for admin to connect bot...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

// Auto-start bot if already paired (auth session exists)
const authDir = path.join(__dirname, 'auth');
const credsFile = path.join(authDir, 'creds.json');
if (fs.existsSync(credsFile)) {
  console.log('[BOTIFY X] Existing session found. Auto-connecting...');
  const { startBot } = require('./bot');
  startBot(null).catch(err => console.error('[BOTIFY X] Auto-connect error:', err.message));
}
