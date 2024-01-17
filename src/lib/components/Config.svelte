<script>
    export let data;
    let config = data.config;
</script>
<form method="POST" action="?/config">
    <!-- for each entry in config, make a new input with the config key and value -->
    {#each Object.entries(config) as [key, value]}
        <label for={key}>{key}</label>
        <input type="text" id={key} name={key} value={value}/>
    {/each}
    <button type="submit">Update Config</button>
</form>