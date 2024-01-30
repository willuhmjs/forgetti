import { writable } from "svelte/store";
import type { Config } from "./types";

export default writable<Config>();