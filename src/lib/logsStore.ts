import { writable, get } from 'svelte/store';
import type { AppUpdateResponsePacket } from './types';
import { socketStore } from "$lib/wsClient";

const logsStore = writable<AppUpdateResponsePacket[]>([{
    purpose: "appUpdate",
    message: "Logs initialized.",
    command: "meta",
    type: "success",
    toastable: false,
    time: new Date().toLocaleTimeString("en-US")
}]);

if (typeof window !== 'undefined') {
    socketStore.subscribe(data => {
        if (data?.purpose === "appUpdate") {
            logsStore.set([...get(logsStore), data])
        }
    })
}

export default logsStore;