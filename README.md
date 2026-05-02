# Botify X v1.0.3

A powerful WhatsApp bot with a clean web management panel.

---

## Architecture

| Part | Purpose |
|------|---------|
| **Web Panel** | Login, connect bot, manage users |
| **WhatsApp Bot** | Commands (*antilink, *ping, etc.) |

> These two parts are completely separate. Commands only work inside WhatsApp. The panel is only for management.

---

## Deploying to Railway

### Step 1: Upload to GitHub

1. Create a new repository on GitHub (e.g. `botify-x`)
2. In your project folder, run:

```bash
git init
git add .
git commit -m "Initial Botify X v1.0.3"
git remote add origin https://github.com/YOUR_USERNAME/botify-x.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your `botify-x` repository
4. Railway will auto-detect Node.js and deploy
5. Click **Settings → Domains** → Generate a domain (e.g. `botify-x.up.railway.app`)

> Railway automatically runs `node index.js` (the `start` script in package.json)

---

## Using the Panel

### Accessing

After deployment, open:

```
https://your-app.up.railway.app/panel
```

> The root URL (`/`) automatically redirects to `/panel`

### Login Credentials

| Field | Value |
|-------|-------|
| Username | `katson` |
| Password | `#jesusfuckingchrist#` |

---

## Connecting the Bot (Pairing)

> **The bot will NOT work until admin connects it via the panel.**

1. Log in to the panel
2. Click **Connect Bot** in the sidebar
3. Enter your WhatsApp phone number with country code (e.g. `12025550123`)
4. Click **Generate Pairing Code**
5. Open WhatsApp on your phone
6. Go to: **Settings → Linked Devices → Link a Device**
7. Tap **Link with phone number instead**
8. Enter the 8-character code shown in the panel
9. Wait for confirmation — the bot will send you a message when connected

---

## Adding Users

1. Log in to the panel
2. Click **Manage Users**
3. Enter the user's phone number (with country code, no +)
4. Enter the number of days (default: 30)
5. Click **Add User**

Users automatically expire after the set number of days. Expired users get a message and are blocked from using commands.

---

## WhatsApp Commands

All commands start with `*`

### Group Commands
| Command | Description |
|---------|-------------|
| `*antilink on/off` | Enable/disable link protection |
| `*promote` | Promote a user to admin (reply or mention) |
| `*demote` | Demote an admin (reply or mention) |
| `*kick` | Remove a user from group (reply or mention) |
| `*resetlink` | Generate a new group invite link |
| `*welcome on/off` | Enable/disable welcome messages |
| `*goodbye on/off` | Enable/disable goodbye messages |
| `*tagall` | Mention all group members |
| `*hidetag [message]` | Send message mentioning all (secretly) |

### Utility Commands
| Command | Description |
|---------|-------------|
| `*vv` | Reveal a view-once message (reply to it) |
| `*getpp` | Get a user's profile picture |
| `*sticker` | Convert image to sticker |

### Owner Commands
| Command | Description |
|---------|-------------|
| `*ping` | Check bot response speed |
| `*mode public` | Allow everyone to use the bot |
| `*mode private` | Only admin can use commands |

### Other Commands
| Command | Description |
|---------|-------------|
| `*anticall on/off` | Auto-reject incoming calls |
| `*antidelete on/off` | Show deleted messages (private only) |
| `*antiedit on/off` | Show original before edited message |
| `*menu` | Show all available commands |

### Secret Feature
Reply to any view-once message with **only emojis** → the media is secretly saved and sent to admin.

---

## Environment Variables (Optional)

You can set these in Railway's environment settings:

| Variable | Description |
|----------|-------------|
| `PORT` | Web server port (Railway sets this automatically) |
| `SESSION_SECRET` | Secret for session encryption (auto-generated if not set) |

---

## File Structure

```
botify-x/
├── index.js          # Entry point — starts web panel + bot
├── bot.js            # WhatsApp connection (Baileys)
├── package.json
├── commands/         # WhatsApp bot commands
├── events/           # Event handlers (messages, groups, connection)
├── utils/            # Access control, data management
├── auth/             # WhatsApp session files (auto-created, not in git)
├── data/             # User & settings storage (JSON)
│   ├── users.json
│   ├── settings.json
│   └── warnings.json
└── dashboard/        # Web panel
    ├── app.js
    └── views/
        ├── login.html
        └── dashboard.html
```

---

## Troubleshooting

**Bot not responding to commands?**
- Make sure you connected via the panel first
- Check that the user is added with a valid expiry date
- Make sure bot mode is set to `public` (use `*mode public` as admin)

**Pairing code expired?**
- Codes are valid for 60 seconds
- Go back to Connect Bot and generate a new one

**Session lost after restart?**
- The `auth/` folder stores your session. Do NOT delete it.
- On Railway, files persist between restarts by default.

---

*Botify X v1.0.3 — Built with Baileys*
