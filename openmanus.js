const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// OpenManus Hauptseite
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('openmanus/index', {
    title: 'OpenManus AI',
    user: req.user,
    messages: req.flash()
  });
});

// OpenManus Chat-Oberfläche
router.get('/chat', ensureAuthenticated, (req, res) => {
  res.render('openmanus/chat', {
    title: 'OpenManus Chat',
    user: req.user,
    messages: req.flash()
  });
});

// OpenManus API-Anfrage senden
router.post('/api/chat', ensureAuthenticated, async (req, res) => {
  try {
    const { message, model } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Keine Nachricht angegeben' });
    }
    
    // Hier würde normalerweise die Anfrage an die OpenManus API gesendet werden
    // Da wir keine direkte API-Verbindung haben, simulieren wir die Antwort
    
    // Simulierte Antwort (in einer echten Implementierung würde hier die API-Anfrage stehen)
    const response = {
      success: true,
      model: model || 'default',
      message: message,
      response: `Dies ist eine simulierte Antwort von OpenManus auf Ihre Anfrage: "${message}". In einer echten Implementierung würde hier die Antwort der OpenManus API stehen.`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('OpenManus API-Fehler:', error);
    res.status(500).json({ 
      error: 'Fehler bei der Kommunikation mit der OpenManus API',
      details: error.message
    });
  }
});

// OpenManus Kommandozeilen-Befehl ausführen
router.post('/api/command', ensureAuthenticated, (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Kein Befehl angegeben' });
    }
    
    // Hier würde normalerweise der OpenManus CLI-Befehl ausgeführt werden
    // Da wir keine direkte CLI-Integration haben, simulieren wir die Ausführung
    
    // Simulierte Befehlsausführung
    const process = spawn('echo', [`Simulierte Ausführung des OpenManus-Befehls: ${command}`]);
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      res.json({
        success: code === 0,
        command: command,
        stdout: stdout,
        stderr: stderr,
        exitCode: code
      });
    });
  } catch (error) {
    console.error('OpenManus Befehlsfehler:', error);
    res.status(500).json({ 
      error: 'Fehler bei der Ausführung des OpenManus-Befehls',
      details: error.message
    });
  }
});

// OpenManus Einstellungen speichern
router.post('/api/settings', ensureAuthenticated, (req, res) => {
  try {
    const { apiKey, defaultModel, maxTokens } = req.body;
    
    // Hier würden die Einstellungen in einer Konfigurationsdatei gespeichert werden
    const settings = {
      apiKey: apiKey || '',
      defaultModel: defaultModel || 'gpt-3.5-turbo',
      maxTokens: maxTokens || 1000,
      updatedAt: new Date().toISOString()
    };
    
    // Einstellungen in einer JSON-Datei speichern
    const settingsPath = path.join(__dirname, '../config/openmanus-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    res.json({
      success: true,
      message: 'Einstellungen erfolgreich gespeichert'
    });
  } catch (error) {
    console.error('OpenManus Einstellungsfehler:', error);
    res.status(500).json({ 
      error: 'Fehler beim Speichern der OpenManus-Einstellungen',
      details: error.message
    });
  }
});

// OpenManus Einstellungen abrufen
router.get('/api/settings', ensureAuthenticated, (req, res) => {
  try {
    // Einstellungen aus der JSON-Datei lesen
    const settingsPath = path.join(__dirname, '../config/openmanus-settings.json');
    
    // Prüfen, ob die Datei existiert
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      res.json(settings);
    } else {
      // Standardeinstellungen zurückgeben, wenn keine Datei existiert
      res.json({
        apiKey: '',
        defaultModel: 'gpt-3.5-turbo',
        maxTokens: 1000,
        updatedAt: null
      });
    }
  } catch (error) {
    console.error('OpenManus Einstellungsfehler:', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der OpenManus-Einstellungen',
      details: error.message
    });
  }
});

module.exports = router;
