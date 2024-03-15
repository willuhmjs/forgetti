This section outlines the installation process for Forgetti on a Raspberry Pi running Raspberry Pi OS. If you are not using a Debian-based distribution, please see the [Manual Installation](#manual-installation) section for more information.

### Script Installation

To install, run the following command in your home directory. The app will be hosted at `raspberrypi:4173`.

```bash
curl -sSL https://raw.githubusercontent.com/willuhmjs/forgetti/main/install.sh | sh
```

### Manual Installation

Install the required packages and update the system:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git nodejs -y
sudo npm install -g pnpm
```

Clone the repository to your home directory and build the project:

```bash
cd ~/ && git clone https://github.com/willuhmjs/forgetti
cd forgetti && pnpm install --frozen-lockfile && pnpm build
```

Create a new systemd service:

```bash
sudo nano /etc/systemd/system/forgetti.service
```

Paste the following into the file, replacing `YOUR_USERNAME` with your username:

```ini

[Unit]
Description=Forgetti Api
Documentation=https://willuhmjs.github.io/forgetti
Requires=network-online.target
After=network-online.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
User=will
RemainAfterExit=yes
WorkingDirectory=/home/will/forgetti
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
ExecStart=pnpm run preview
Restart=always
```

Reload systemd and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl start forgetti
sudo systemctl enable forgetti
```
