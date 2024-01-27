## Updating

This section outlines the installation process for Forgetti on a Raspberry Pi running Raspberry Pi OS. If you are not using a Debian-based distribution, please see the Manual Installation section for more information.

### Automatic Update

You can perform an automatic update by clicking :fontawesome-solid-rotate: in the top right corner of the application. This will download the latest version of the application, install it, and restart the application.

### Manual Update

Run the following commands:

```bash
cd /home/"$USER"/forgetti
git pull -q
pnpm install
pnpm run build
sudo systemctl restart forgetti
```
