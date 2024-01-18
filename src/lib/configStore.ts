import { writable } from "svelte/store";
import currentConfig from "./config.json";
export default writable(currentConfig);