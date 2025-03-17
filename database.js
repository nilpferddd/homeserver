const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite-Datenbank mit Sequelize konfigurieren
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db', 'homeserver.sqlite'),
  logging: false
});

// Datenbankverbindung testen
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite-Datenbankverbindung erfolgreich hergestellt.');
  } catch (error) {
    console.error('Fehler bei der Datenbankverbindung:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
