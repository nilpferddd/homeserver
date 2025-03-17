const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/database');
const User = require('./models/User');

// Express-App initialisieren
const app = express();

// Passport-Konfiguration laden
require('./config/passport')(passport);

// Datenbankverbindung herstellen
connectDB();

// View Engine einrichten
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());

// Sicherheits-Middleware (mit Anpassungen für lokale Entwicklung)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Express-Session
app.use(
  session({
    secret: 'homeserver_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 Tag
    },
  })
);

// Passport-Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash-Nachrichten
app.use(flash());

// Globale Variablen
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routen
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/terminal', require('./routes/terminal'));
app.use('/admin', require('./routes/admin'));
app.use('/openmanus', require('./routes/openmanus'));

// Hauptseite
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

// Datenbank synchronisieren und Admin-Benutzer erstellen
const initializeDatabase = async () => {
  try {
    // Tabellen erstellen oder aktualisieren
    await sequelize.sync();
    
    // Prüfen, ob Admin-Benutzer existiert
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      // Admin-Benutzer erstellen
      await User.create({
        username: 'admin',
        password: 'changeme',
        isAdmin: true
      });
      console.log('Admin-Benutzer wurde erstellt');
    }
  } catch (err) {
    console.error('Fehler bei der Datenbankinitialisierung:', err);
  }
};

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server läuft auf Port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;
