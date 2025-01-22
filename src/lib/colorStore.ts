import { writable, get } from "svelte/store";

const colorStore = writable<string>("#f97316");

export default colorStore;