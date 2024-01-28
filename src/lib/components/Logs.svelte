<script>
    import { socketStore } from "$lib/wsClient";
    import { onMount } from "svelte";
    import toast from "svelte-french-toast";
    let logs = [{
        purpose: "success",
        message: "Logs initialized",
        command: "meta",
        type: "success"
    }];

    onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'logs') {
                if (data.toastable) {
                    toast(data.message, {
                        duration: 5000,
                        position: 'bottom-right',
                        style: [
                            "background-color: var(--foreground);",
                            "color: white",
                        ].join("")
                    })
                }
				logs = [...logs, data];
			}
		});
	});
</script>

<div class="logs">
    {#each logs as update}
        <p class="update {update.type}">
            {update.command}: {update.message}
        </p>
    {/each}
</div>

<style>
    .logs {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        
    }

    .update {
    }

    .success {
        background-color: var(--green);
    }

    .error {
        background-color: var(--red);
    }
</style>