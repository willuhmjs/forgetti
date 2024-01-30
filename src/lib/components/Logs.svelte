<script>
    import logsStore from "$lib/logsStore";
</script>

<div class="appUpdate">
    {#each $logsStore as update}
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