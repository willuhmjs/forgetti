rm -rf /home/"$USER"/forgetti
sudo systemctl disable forgetti
sudo systemctl stop forgetti
sudo rm -rf /etc/systemd/system/forgetti.service
sudo systemctl daemon-reload
