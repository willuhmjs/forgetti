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
        {#if formData && typeof formData === 'object'}
                    <fieldset>
                        <legend>General</legend>
                        {#each Object.entries(formData["General"]) as [key, value] (key)}
                            <label for="{key}">
                            <p>{key}</p>
                            <input id="{key}" bind:value={formData["General"][key]} />
                        </label>
                        {/each}
                    </fieldset>
        {/if}
        <button type="submit">Save</button>
    </form>
</div>