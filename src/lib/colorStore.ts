import { writable, get } from "svelte/store";

const colorStore = writable<string>();

export default colorStore;