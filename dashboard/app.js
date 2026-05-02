const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { addUser, removeUser, getUsers, updateUser } = require('../utils/dataManager');
const { setAdminNumber, getAdminNumber, isConnected } = require('../utils/botState');

const ADMIN_CREDENTIALS = {
  username: 'katson',
  password: '#jesusfuckingchrist#'
};

const SESSION_SECRET = process.env.SESSION_SECRET || 'botifyx-super-secret-key-2024';

function createDashboard() {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  }));

  app.use(express.static(path.join(__dirname, 'public')));

  // Auth middleware
  function requireAuth(req, res, next) {
    if (req.session && req.session.loggedIn) return next();
    return res.redirect('/panel');
  }

  // Root redirect
  app.get('/', (req, res) => res.redirect('/panel'));

  // Panel route: login page
  app.get('/panel', (req, res) => {
    if (req.session && req.session.loggedIn) {
      return res.redirect('/panel/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });

  // Login POST
  app.post('/panel/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      req.session.loggedIn = true;
      return res.json({ success: true, redirect: '/panel/dashboard' });
    }
    return res.json({ success: false, message: 'Invalid username or password.' });
  });

  // Logout
  app.post('/panel/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  // Dashboard
  app.get('/panel/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  });

  // Bot status API
  app.get('/panel/api/status', requireAuth, (req, res) => {
    res.json({
      connected: isConnected(),
      adminNumber: getAdminNumber() || null
    });
  });

  // Pairing: request code
  app.post('/panel/api/pair', requireAuth, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.json({ success: false, message: 'Phone number required.' });

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) return res.json({ success: false, message: 'Enter a valid phone number with country code.' });

    if (isConnected()) {
      return res.json({ success: false, message: 'Bot is already connected.' });
    }

    const { startBot } = require('../bot');
    try {
      setAdminNumber(clean);
      const code = await startBot(clean);
      if (code) {
        return res.json({ success: true, code });
      }
      return res.json({ success: false, message: 'Failed to generate pairing code. Try again.' });
    } catch (err) {
      console.error('[Pair Error]', err.message);
      return res.json({ success: false, message: err.message });
    }
  });

  // Users API
  app.get('/panel/api/users', requireAuth, (req, res) => {
    const users = getUsers();
    res.json({ users });
  });

  app.post('/panel/api/users/add', requireAuth, (req, res) => {
    const { phone, days } = req.body;
    if (!phone) return res.json({ success: false, message: 'Phone number required.' });
    const clean = phone.replace(/[^0-9]/g, '');
    const user = addUser(clean, parseInt(days) || 30);
    res.json({ success: true, user });
  });

  app.post('/panel/api/users/remove', requireAuth, (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.json({ success: false, message: 'Phone required.' });
    removeUser(phone.replace(/[^0-9]/g, ''));
    res.json({ success: true });
  });

  app.post('/panel/api/users/toggle', requireAuth, (req, res) => {
    const { phone, active } = req.body;
    if (!phone) return res.json({ success: false, message: 'Phone required.' });
    const updated = updateUser(phone.replace(/[^0-9]/g, ''), { active });
    res.json({ success: updated });
  });

  return app;
}

module.exports = { createDashboard };
