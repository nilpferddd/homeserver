const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Benutzer auflisten (nur für Admins)
router.get('/users', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.render('users', {
      title: 'Benutzerverwaltung',
      user: req.user,
      users: users,
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Fehler beim Abrufen der Benutzer');
    res.redirect('/dashboard');
  }
});

// Benutzer erstellen (nur für Admins)
router.post('/users/create', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    
    // Überprüfen, ob Benutzer bereits existiert
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      req.flash('error_msg', 'Benutzername existiert bereits');
      return res.redirect('/admin/users');
    }
    
    // Neuen Benutzer erstellen
    await User.create({
      username,
      password,
      isAdmin: isAdmin === 'on'
    });
    
    req.flash('success_msg', 'Benutzer erfolgreich erstellt');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Fehler beim Erstellen des Benutzers');
    res.redirect('/admin/users');
  }
});

// Benutzer löschen (nur für Admins)
router.post('/users/delete', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Überprüfen, ob der Benutzer sich selbst löschen möchte
    if (parseInt(userId) === req.user.id) {
      req.flash('error_msg', 'Sie können Ihren eigenen Benutzer nicht löschen');
      return res.redirect('/admin/users');
    }
    
    // Benutzer löschen
    await User.destroy({ where: { id: userId } });
    
    req.flash('success_msg', 'Benutzer erfolgreich gelöscht');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Fehler beim Löschen des Benutzers');
    res.redirect('/admin/users');
  }
});

// Benutzerpasswort zurücksetzen (nur für Admins)
router.post('/users/reset-password', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    // Benutzer finden
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Benutzer nicht gefunden');
      return res.redirect('/admin/users');
    }
    
    // Passwort aktualisieren
    user.password = newPassword;
    await user.save();
    
    req.flash('success_msg', 'Passwort erfolgreich zurückgesetzt');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Fehler beim Zurücksetzen des Passworts');
    res.redirect('/admin/users');
  }
});

// Benutzerrechte ändern (nur für Admins)
router.post('/users/toggle-admin', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Überprüfen, ob der Benutzer seine eigenen Rechte ändern möchte
    if (parseInt(userId) === req.user.id) {
      req.flash('error_msg', 'Sie können Ihre eigenen Administratorrechte nicht ändern');
      return res.redirect('/admin/users');
    }
    
    // Benutzer finden
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Benutzer nicht gefunden');
      return res.redirect('/admin/users');
    }
    
    // Admin-Status umschalten
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    req.flash('success_msg', `Administratorrechte für ${user.username} ${user.isAdmin ? 'aktiviert' : 'deaktiviert'}`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Fehler beim Ändern der Benutzerrechte');
    res.redirect('/admin/users');
  }
});

module.exports = router;
