import { writable } from 'svelte/store';
import currentConfig from '../../config.json?raw';

export default writable(JSON.parse(currentConfig));
