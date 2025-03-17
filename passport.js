const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Passport-Konfiguration mit lokaler Strategie
module.exports = function(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Benutzer in der Datenbank suchen
        const user = await User.findOne({ where: { username } });
        
        // Wenn Benutzer nicht gefunden wurde
        if (!user) {
          return done(null, false, { message: 'Benutzer nicht gefunden' });
        }
        
        // Passwort überprüfen
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          // Letzten Login aktualisieren
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        } else {
          return done(null, false, { message: 'Falsches Passwort' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // Benutzer in Session speichern
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Benutzer aus Session abrufen
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
