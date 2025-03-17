const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const multer = require('multer');

// Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../scripts'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Nur Python-Dateien akzeptieren
const fileFilter = (req, file, cb) => {
  if (file.originalname.endsWith('.py')) {
    cb(null, true);
  } else {
    cb(new Error('Nur Python-Dateien (.py) sind erlaubt'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB Limit
  }
});

// Dashboard-Hauptseite
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    messages: req.flash()
  });
});

// Systemstatus anzeigen
router.get('/system-status', ensureAuthenticated, (req, res) => {
  exec('uptime && free -h && df -h', (error, stdout, stderr) => {
    res.render('system-status', {
      title: 'Systemstatus',
      user: req.user,
      systemInfo: stdout,
      messages: req.flash()
    });
  });
});

// Python-Scripts anzeigen
router.get('/scripts', ensureAuthenticated, (req, res) => {
  const scriptsDir = path.join(__dirname, '../scripts');
  
  // Sicherstellen, dass das Scripts-Verzeichnis existiert
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  fs.readdir(scriptsDir, (err, files) => {
    if (err) {
      req.flash('error_msg', 'Fehler beim Lesen des Script-Verzeichnisses');
      return res.redirect('/dashboard');
    }
    
    // Nur Python-Dateien filtern
    const pythonFiles = files.filter(file => file.endsWith('.py'));
    
    res.render('scripts', {
      title: 'Python Scripts',
      user: req.user,
      scripts: pythonFiles,
      messages: req.flash()
    });
  });
});

// Script-Inhalt anzeigen/bearbeiten
router.get('/scripts/edit/:scriptName', ensureAuthenticated, (req, res) => {
  const scriptName = req.params.scriptName;
  const scriptPath = path.join(__dirname, '../scripts', scriptName);
  
  // Überprüfen, ob die Datei existiert
  if (!fs.existsSync(scriptPath)) {
    req.flash('error_msg', 'Script nicht gefunden');
    return res.redirect('/dashboard/scripts');
  }
  
  // Script-Inhalt lesen
  fs.readFile(scriptPath, 'utf8', (err, content) => {
    if (err) {
      req.flash('error_msg', 'Fehler beim Lesen des Scripts');
      return res.redirect('/dashboard/scripts');
    }
    
    res.render('edit-script', {
      title: 'Script bearbeiten',
      user: req.user,
      scriptName: scriptName,
      scriptContent: content,
      messages: req.flash()
    });
  });
});

// Script aktualisieren
router.post('/scripts/update', ensureAuthenticated, (req, res) => {
  const { scriptName, scriptContent } = req.body;
  const scriptPath = path.join(__dirname, '../scripts', scriptName);
  
  // Script-Inhalt speichern
  fs.writeFile(scriptPath, scriptContent, 'utf8', (err) => {
    if (err) {
      req.flash('error_msg', 'Fehler beim Speichern des Scripts');
    } else {
      req.flash('success_msg', 'Script erfolgreich gespeichert');
    }
    res.redirect('/dashboard/scripts');
  });
});

// Script hochladen
router.post('/scripts/upload', ensureAuthenticated, upload.single('scriptFile'), (req, res) => {
  // Wenn kein File hochgeladen wurde, aber scriptName und scriptContent vorhanden sind
  if (!req.file && req.body.scriptName && req.body.scriptContent) {
    const scriptName = req.body.scriptName.endsWith('.py') ? req.body.scriptName : `${req.body.scriptName}.py`;
    const scriptPath = path.join(__dirname, '../scripts', scriptName);
    
    // Script-Inhalt speichern
    fs.writeFile(scriptPath, req.body.scriptContent, 'utf8', (err) => {
      if (err) {
        req.flash('error_msg', 'Fehler beim Speichern des Scripts');
      } else {
        req.flash('success_msg', 'Script erfolgreich erstellt');
      }
      res.redirect('/dashboard/scripts');
    });
  } else if (req.file) {
    // Wenn eine Datei hochgeladen wurde
    req.flash('success_msg', 'Script erfolgreich hochgeladen');
    res.redirect('/dashboard/scripts');
  } else {
    req.flash('error_msg', 'Keine Datei ausgewählt oder ungültiges Format');
    res.redirect('/dashboard/scripts');
  }
});

// Script löschen
router.post('/scripts/delete', ensureAuthenticated, (req, res) => {
  const scriptName = req.body.scriptName;
  const scriptPath = path.join(__dirname, '../scripts', scriptName);
  
  // Überprüfen, ob die Datei existiert
  if (!fs.existsSync(scriptPath)) {
    req.flash('error_msg', 'Script nicht gefunden');
    return res.redirect('/dashboard/scripts');
  }
  
  // Script löschen
  fs.unlink(scriptPath, (err) => {
    if (err) {
      req.flash('error_msg', 'Fehler beim Löschen des Scripts');
    } else {
      req.flash('success_msg', 'Script erfolgreich gelöscht');
    }
    res.redirect('/dashboard/scripts');
  });
});

// Script ausführen
router.post('/scripts/run', ensureAuthenticated, (req, res) => {
  const scriptName = req.body.scriptName;
  const scriptPath = path.join(__dirname, '../scripts', scriptName);
  
  // Überprüfen, ob die Datei existiert
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: 'Script nicht gefunden' });
  }
  
  // Script ausführen
  exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      return res.json({ 
        success: false, 
        output: stderr || 'Fehler bei der Ausführung des Scripts'
      });
    }
    
    res.json({ 
      success: true, 
      output: stdout || 'Script erfolgreich ausgeführt (keine Ausgabe)'
    });
  });
});

// Benutzereinstellungen
router.get('/settings', ensureAuthenticated, (req, res) => {
  res.render('settings', {
    title: 'Einstellungen',
    user: req.user,
    messages: req.flash()
  });
});

module.exports = router;
