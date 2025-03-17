#!/bin/bash

# Homeserver mit OpenManus Integration - Installationsskript
# Dieses Skript installiert und konfiguriert den Homeserver mit Admin-Weboberfläche und OpenManus AI-Integration

# Farbdefinitionen
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion zum Anzeigen von Fortschritt
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Funktion zum Anzeigen von Erfolg
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Funktion zum Anzeigen von Warnungen
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Funktion zum Anzeigen von Fehlern
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfen, ob das Skript als Root ausgeführt wird
if [ "$EUID" -ne 0 ]; then
    print_error "Dieses Skript muss als Root ausgeführt werden. Bitte mit sudo ausführen."
    exit 1
fi

# Willkommensnachricht
echo "============================================="
echo "   Homeserver Installation mit OpenManus AI"
echo "============================================="
echo ""
print_status "Dieses Skript installiert und konfiguriert den Homeserver mit Admin-Weboberfläche und OpenManus AI-Integration."
echo ""

# Variablen
INSTALL_DIR="/opt/homeserver"
PORT=3000
ADMIN_USER="admin"
ADMIN_PASS="changeme"

# Konfigurationsoptionen abfragen
read -p "Installationsverzeichnis [$INSTALL_DIR]: " input
INSTALL_DIR=${input:-$INSTALL_DIR}

read -p "Server-Port [$PORT]: " input
PORT=${input:-$PORT}

read -p "Admin-Benutzername [$ADMIN_USER]: " input
ADMIN_USER=${input:-$ADMIN_USER}

read -p "Admin-Passwort [$ADMIN_PASS]: " input
ADMIN_PASS=${input:-$ADMIN_PASS}

echo ""
print_status "Installation wird mit folgenden Einstellungen durchgeführt:"
echo "Installationsverzeichnis: $INSTALL_DIR"
echo "Server-Port: $PORT"
echo "Admin-Benutzername: $ADMIN_USER"
echo "Admin-Passwort: $ADMIN_PASS"
echo ""

read -p "Fortfahren? (j/n): " confirm
if [[ $confirm != [jJ] ]]; then
    print_warning "Installation abgebrochen."
    exit 0
fi

# Systemaktualisierung
print_status "Aktualisiere Systempaketlisten..."
apt-get update

# Notwendige Pakete installieren
print_status "Installiere notwendige Pakete..."
apt-get install -y nodejs npm sqlite3 build-essential

# Node.js-Version prüfen
NODE_VERSION=$(node -v)
print_status "Node.js-Version: $NODE_VERSION"

# Installationsverzeichnis erstellen
print_status "Erstelle Installationsverzeichnis $INSTALL_DIR..."
mkdir -p $INSTALL_DIR

# Projektdateien kopieren
print_status "Kopiere Projektdateien..."
cp -r /home/ubuntu/homeserver/* $INSTALL_DIR/

# In das Installationsverzeichnis wechseln
cd $INSTALL_DIR

# Konfigurationsdatei anpassen
print_status "Passe Konfiguration an..."
sed -i "s/const PORT = process.env.PORT || 3000;/const PORT = process.env.PORT || $PORT;/" app.js

# NPM-Pakete installieren
print_status "Installiere NPM-Pakete..."
npm install

# Skript-Verzeichnis erstellen
print_status "Erstelle Skript-Verzeichnis..."
mkdir -p $INSTALL_DIR/scripts

# Beispiel-Python-Skript erstellen
print_status "Erstelle Beispiel-Python-Skript..."
cat > $INSTALL_DIR/scripts/hello.py << EOL
#!/usr/bin/env python3
# Beispiel-Python-Skript

print("Hallo vom Homeserver!")
print("Dieses Skript wurde erfolgreich ausgeführt.")
print("Sie können weitere Python-Skripte über die Weboberfläche hochladen und ausführen.")
EOL

# OpenManus-Konfiguration erstellen
print_status "Erstelle OpenManus-Konfiguration..."
mkdir -p $INSTALL_DIR/config
cat > $INSTALL_DIR/config/openmanus-settings.json << EOL
{
  "apiKey": "",
  "defaultModel": "gpt-3.5-turbo",
  "maxTokens": 1000,
  "updatedAt": "$(date -Iseconds)"
}
EOL

# Berechtigungen setzen
print_status "Setze Berechtigungen..."
chmod -R 755 $INSTALL_DIR
chmod +x $INSTALL_DIR/scripts/hello.py

# Systemd-Service erstellen
print_status "Erstelle Systemd-Service..."
cat > /etc/systemd/system/homeserver.service << EOL
[Unit]
Description=Homeserver Admin Interface mit OpenManus AI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node app.js
Restart=on-failure
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOL

# Systemd-Service aktivieren und starten
print_status "Aktiviere und starte Systemd-Service..."
systemctl daemon-reload
systemctl enable homeserver.service
systemctl start homeserver.service

# Firewall-Regeln hinzufügen (wenn ufw installiert ist)
if command -v ufw &> /dev/null; then
    print_status "Konfiguriere Firewall..."
    ufw allow $PORT/tcp
    print_success "Firewall-Regel für Port $PORT hinzugefügt."
else
    print_warning "ufw ist nicht installiert. Firewall-Regeln wurden nicht konfiguriert."
fi

# Erfolgreiche Installation
print_success "Homeserver mit OpenManus AI wurde erfolgreich installiert!"
print_success "Der Server läuft auf Port $PORT."
print_success "Sie können auf die Weboberfläche zugreifen unter: http://SERVER_IP:$PORT"
print_success "Anmeldedaten: Benutzername: $ADMIN_USER, Passwort: $ADMIN_PASS"
print_warning "Bitte ändern Sie das Passwort nach der ersten Anmeldung!"

echo ""
echo "============================================="
echo "   Installation abgeschlossen"
echo "============================================="
echo ""
print_status "Funktionen des Homeservers:"
echo "1. Admin-Dashboard mit Systemstatusanzeige"
echo "2. Python-Script-Verwaltung und -Ausführung"
echo "3. Terminal-basierter Remote-Zugriff"
echo "4. Benutzerverwaltung"
echo "5. OpenManus AI-Integration mit Chat und CLI"
echo ""
print_status "Viel Spaß mit Ihrem neuen Homeserver!"
