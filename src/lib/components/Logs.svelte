<script>
    import { socketStore } from "$lib/wsClient";
    import { onMount } from "svelte";
    let appUpdate = [{
        purpose: "success",
        message: "Logs initialized",
        command: "meta",
        type: "success"
    }];

    onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'appUpdate') {
				appUpdate = [...appUpdate, data];
			}
		});
	});
</script>

<div class="appUpdate">
    {#each appUpdate as update}
        <p class="update {update.type}">
            {update.command}: {update.message}
        </p>
    {/each}
</div>

<style>
    .appUpdate {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        
    }

    .success {
        background-color: var(--green);
    }

    .error {
        background-color: var(--red);
    }
</style>