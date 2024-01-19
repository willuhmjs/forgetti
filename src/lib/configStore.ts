import { writable } from 'svelte/store';
import currentConfig from '../../config.json?raw';

interface Config {
    CameraURL: string
}

export default writable<Config>(JSON.parse(currentConfig));
