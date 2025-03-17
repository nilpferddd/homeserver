const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');

// Login-Seite anzeigen
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    messages: req.flash()
  });
});

// Login-Anfrage verarbeiten
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'Sie wurden erfolgreich abgemeldet');
    res.redirect('/auth/login');
  });
});

// Passwort ändern (nur für authentifizierte Benutzer)
router.get('/change-password', ensureAuthenticated, (req, res) => {
  res.render('change-password', {
    title: 'Passwort ändern',
    user: req.user,
    messages: req.flash()
  });
});

// Passwort-Änderung verarbeiten
router.post('/change-password', ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  try {
    // Überprüfen, ob das aktuelle Passwort korrekt ist
    const isMatch = await req.user.comparePassword(currentPassword);
    
    if (!isMatch) {
      req.flash('error_msg', 'Aktuelles Passwort ist falsch');
      return res.redirect('/auth/change-password');
    }
    
    // Überprüfen, ob das neue Passwort und die Bestätigung übereinstimmen
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'Neue Passwörter stimmen nicht überein');
      return res.redirect('/auth/change-password');
    }
    
    // Passwort aktualisieren
    req.user.password = newPassword;
    await req.user.save();
    
    req.flash('success_msg', 'Passwort erfolgreich geändert');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Ein Fehler ist aufgetreten');
    res.redirect('/auth/change-password');
  }
});

module.exports = router;
