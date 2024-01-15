#!/bin/bash

# Function to check if a command is available
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if git and node.js are installed
if ! command_exists git || ! command_exists node; then
  sudo apt update -y && sudo apt install nodejs git -y
fi

# Set working directory
WORKING_DIR=/home/$USER/forgetti

# Clone the forgetti repo to the working directory
git clone https://github.com/willuhmjs/forgetti.git $WORKING_DIR

# Install Node.js dependencies
cd $WORKING_DIR
npm install

# Create a systemd service file
cat <<EOF | sudo tee /etc/systemd/system/forgetti.service
[Unit]
Description=Forgetti App
After=network.target

[Service]
ExecStart=/usr/bin/bash -c 'cd $WORKING_DIR && /usr/bin/git pull && /usr/bin/npm install && /usr/bin/npm run build && /usr/bin/npm run preview'
Restart=always
User=$USER
Group=$USER
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start the forgetti service
sudo systemctl daemon-reload
sudo systemctl enable forgetti
sudo systemctl start forgetti

echo "Forgetti installed successfully!"
