#!/bin/bash

sudo apt update -y && sudo apt upgrade -y

# Function to check if a command is available
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if git is installed
if ! command_exists git; then
  echo "Git is not installed. Installing..."
  sudo apt install -y git
fi

# Check if Node.js is installed
if ! command_exists node; then
  echo "Node.js is not installed. Installing..."
  sudo apt install -y nodejs
fi

if ! command_exists npm; then
  echo "npm is not installed. Installing..."
  sudo apt install -y npm
fi

if ! command_exists pnpm; then
  echo "pnpm is not installed. Installing..."
  sudo npm install -g pnpm
fi

# Clone the repository to the user's home directory
git clone https://github.com/willuhmjs/forgetti /home/"$USER"/forgetti

# Navigate to the app directory
cd /home/"$USER"/forgetti

# Install dependencies and build the app
pnpm install --prod
pnpm run build

# Create a systemd service
cat <<EOF | sudo tee /etc/systemd/system/forgetti.service
[Unit]
Description=Forgetti App

[Service]
WorkingDirectory=/home/$USER/forgetti
ExecStart=pnpm run preview
Restart=always
User=$USER
Group=$USER
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start the app
sudo systemctl daemon-reload
sudo systemctl start forgetti
sudo systemctl enable forgetti

echo "Forgetti has been installed and configured."
