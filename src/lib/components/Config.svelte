<script lang="ts">
    export let data;
    import type { Config } from "$lib/types";
     let formData: Config = {...data}; // Create a copy of data

const updateConfig = () => {
    fetch('/api/configure', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
}
</script>

<div>
    <form on:submit|preventDefault={updateConfig}>
        {#each Object.entries(formData) as [key, value], i}
        <label>
            <span>{key} {key === 'ConfidenceThreshold' ? `(${formData[key]}%)` : ''}</span>
            <br>
            {#if typeof value === 'boolean'}
                <input type="checkbox" bind:checked={formData[key]} name={key} />
            {:else if typeof value === 'string'}
                <input type="text" bind:value={formData[key]} name={key} />
            {:else if typeof value === 'number'}
                <input type="range" min="1" max="100" bind:value={formData[key]} name={key} />
            {/if}
        </label>
        <br>
        {/each}
        <button type="submit">Save</button>
    </form>
</div>