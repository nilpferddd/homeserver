const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const { spawn } = require('child_process');
const os = require('os');

// Terminal-Seite anzeigen
router.get('/terminal', ensureAuthenticated, (req, res) => {
  res.render('terminal', {
    title: 'Terminal-Zugriff',
    user: req.user,
    messages: req.flash()
  });
});

// Systeminformationen abrufen
router.get('/api/system-info', ensureAuthenticated, (req, res) => {
  const systemInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100, // GB
    freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100, // GB
    uptime: Math.floor(os.uptime() / 3600) + 'h ' + Math.floor((os.uptime() % 3600) / 60) + 'm'
  };
  
  res.json(systemInfo);
});

// Befehl ausführen
router.post('/api/execute-command', ensureAuthenticated, (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Kein Befehl angegeben' });
  }
  
  // Einfache Sicherheitsüberprüfung
  const forbiddenCommands = ['rm -rf', 'mkfs', 'dd', 'format', ':(){:|:&};:'];
  if (forbiddenCommands.some(cmd => command.includes(cmd))) {
    return res.status(403).json({ error: 'Dieser Befehl ist aus Sicherheitsgründen nicht erlaubt' });
  }
  
  // Befehl ausführen
  const process = spawn('bash', ['-c', command]);
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
      exitCode: code,
      stdout,
      stderr
    });
  });
});

module.exports = router;
