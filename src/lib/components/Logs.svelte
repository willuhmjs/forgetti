<script lang="ts">
    import logsStore from "$lib/logsStore";
    import type { AppUpdateResponsePacket } from "$lib/types";
	import { get } from "svelte/store";

    let logs: AppUpdateResponsePacket[] = get(logsStore);
    logsStore.subscribe((value) => {
        logs = value;
   });
</script>

<div class="appUpdate">
    {#each logs as update}
        <p class="update {update.type}">
            <span>{update.command}: {update.message}</span>
            <span>{new Date().toLocaleTimeString()}</span>
        </p>
    {/each}
</div>

<style>
    .appUpdate {
        display: flex;
        flex-direction: column;
        margin: 10px;
        overflow-y: auto;
        gap: 10px;
    }

    .update {
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        display: flex;
        justify-content: space-between; 
        margin: 0;
    }

    .success {
        background-color: var(--green);
    }

    .error {
        background-color: var(--red);
    }
</style>