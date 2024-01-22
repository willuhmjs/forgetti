<script lang="ts">
    export let data;
    import type { Config } from "$lib/types";
    let formData: Config = {...data}; // Create a copy of data

    const updateConfig = () => {
        console.log(formData);
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
            {#each Object.entries(formData) as [category, values] (category)}
                {#if category !== 'Hidden' && values && typeof values === 'object'}
                    <fieldset>
                        <legend>{category}</legend>
                        {#each Object.entries(values) as [key, value] (key)}
                            <label for="{key}">
                            <p>{key}</p>
                            <input id="{key}" bind:value={formData[category][key]} />
                        </label>
                        {/each}
                    </fieldset>
                {/if}
            {/each}
        {/if}
        <button type="submit">Save</button>
    </form>
</div>