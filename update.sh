#!/bin/bash

# Function to check if a command is available
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if git is installed
if ! command_exists git; then
  echo "Git is not installed. Installing..."
  sudo apt update && sudo apt upgrade -y
  sudo apt install -y git
fi

# Check if Node.js is installed
if ! command_exists node; then
  echo "Node.js is not installed. Installing..."
  sudo apt update && sudo apt upgrade -y
  sudo apt install -y nodejs
  sudo npm install -g pnpm
fi

cd /home/"$USER"/forgetti
git pull
pnpm i
pnpm build
sudo systemctl restart forgetti
