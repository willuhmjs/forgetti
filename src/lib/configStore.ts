import { writable } from 'svelte/store';
import fs from "fs";
import configExample from '../../config.example.json?raw';

if (!fs.existsSync("./config.json")) fs.writeFileSync("./config.json", configExample, "utf-8")
const currentConfig = fs.readFileSync("./config.json", "utf-8");

interface Config {
    CameraURL: string
}

export default writable<Config>(JSON.parse(currentConfig));
