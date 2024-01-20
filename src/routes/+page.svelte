<script lang="ts">
    import LivePreview from '$lib/components/LivePreview.svelte';
    import type { Config } from "$lib/types";
    export let data;

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

<LivePreview />

<form on:submit|preventDefault={updateConfig}>
    {#each Object.entries(formData) as [key, value], i}
    <label>
        <span>{key}</span>
        {#if typeof value === 'boolean'}
            <input type="checkbox" bind:checked={formData[key]} name={key} />
        {:else if typeof value === 'string'}
            <input type="text" bind:value={formData[key]} name={key} />
        {/if}
    </label>
{/each}
    <button type="submit">Save</button>
</form>