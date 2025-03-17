# Homeserver mit Admin-Weboberfläche und OpenManus AI-Integration

Diese Dokumentation beschreibt die Installation und Verwendung des Homeservers mit Admin-Weboberfläche und OpenManus AI-Integration.

## Funktionen

Der Homeserver bietet folgende Funktionen:

1. **Authentifizierungssystem** mit sicherer Benutzeranmeldung
2. **Admin-Dashboard** mit Systemstatusanzeige
3. **Python-Script-Verwaltung** zum Hochladen, Bearbeiten und Ausführen von Scripts
4. **Terminal-basierter Remote-Zugriff** über die Weboberfläche
5. **Benutzerverwaltung** mit der Möglichkeit, neue Benutzer zu erstellen und Passwörter zu ändern
6. **OpenManus AI-Integration** mit Chat-Oberfläche und CLI-Schnittstelle

## Installation

### Voraussetzungen

- Linux-Server (getestet auf Ubuntu 22.04)
- Root-Zugriff oder sudo-Berechtigungen
- Internetverbindung für die Installation der Abhängigkeiten

### Installationsschritte

1. Laden Sie das Installationsskript herunter:
   ```
   wget https://example.com/install.sh
   ```

2. Machen Sie das Skript ausführbar:
   ```
   chmod +x install.sh
   ```

3. Führen Sie das Skript als Root aus:
   ```
   sudo ./install.sh
   ```

4. Folgen Sie den Anweisungen im Installationsprogramm:
   - Wählen Sie das Installationsverzeichnis (Standard: /opt/homeserver)
   - Wählen Sie den Server-Port (Standard: 3000)
   - Legen Sie den Admin-Benutzernamen fest (Standard: admin)
   - Legen Sie das Admin-Passwort fest (Standard: changeme)

5. Nach Abschluss der Installation können Sie auf die Weboberfläche zugreifen unter:
   ```
   http://SERVER_IP:PORT
   ```

## Verwendung

### Anmeldung

1. Öffnen Sie die Weboberfläche in einem Browser
2. Melden Sie sich mit den während der Installation festgelegten Anmeldedaten an
3. Bei der ersten Anmeldung wird empfohlen, das Passwort zu ändern

### Dashboard

Das Dashboard bietet einen Überblick über den Systemstatus:
- CPU-Auslastung
- Speichernutzung
- Festplattennutzung
- Laufzeit des Systems

### Python-Scripts

Über die Python-Script-Verwaltung können Sie:
- Neue Scripts hochladen
- Bestehende Scripts bearbeiten
- Scripts ausführen und die Ausgabe anzeigen
- Scripts löschen

### Terminal-Zugriff

Der Terminal-Zugriff ermöglicht:
- Ausführung von Shell-Befehlen über die Weboberfläche
- Zugriff auf das Dateisystem
- Verwaltung von Prozessen
- Schnellbefehle für häufig verwendete Aktionen

### Benutzerverwaltung

Als Administrator können Sie:
- Neue Benutzer erstellen
- Benutzerpasswörter zurücksetzen
- Administratorrechte vergeben oder entziehen
- Benutzer löschen

Jeder Benutzer kann sein eigenes Passwort ändern.

### OpenManus AI-Integration

Die OpenManus AI-Integration bietet:
- Chat-Oberfläche für die Interaktion mit KI-Modellen
- Kommandozeilen-Schnittstelle für fortgeschrittene Funktionen
- Konfigurationsmöglichkeiten für API-Schlüssel und Modelleinstellungen

## Sicherheit

Der Homeserver ist mit verschiedenen Sicherheitsmaßnahmen ausgestattet:
- Passwort-Hashing mit bcrypt
- Session-Management mit Express-Session
- Authentifizierungsprüfung für alle geschützten Routen
- Schutz vor CSRF-Angriffen
- Helmet für HTTP-Header-Sicherheit

## Fehlerbehebung

### Server startet nicht

Überprüfen Sie den Status des Dienstes:
```
sudo systemctl status homeserver
```

Überprüfen Sie die Logs:
```
sudo journalctl -u homeserver
```

### Zugriffsprobleme

Stellen Sie sicher, dass der Port in der Firewall freigegeben ist:
```
sudo ufw status
```

Falls erforderlich, öffnen Sie den Port:
```
sudo ufw allow PORT/tcp
```

### Passwort vergessen

Wenn Sie das Admin-Passwort vergessen haben, können Sie es zurücksetzen:
```
cd /opt/homeserver
node reset-password.js admin NEUES_PASSWORT
```

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an den Support unter support@example.com.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
