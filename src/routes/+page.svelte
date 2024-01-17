<script lang="ts">
    import LivePreview from "$lib/components/LivePreview.svelte";
    import Config from "$lib/components/Config.svelte";
    export let data;
</script>

<LivePreview/>
<Config {data} />