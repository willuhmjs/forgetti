<script lang="ts">
    import type { Config } from "$lib/types";
    export let liveData: Config;
    $: moonrakerEnabled = liveData.MoonrakerEnabled;
    setInterval(async () => {
        console.log(moonrakerEnabled);
        if (!liveData.MoonrakerURL || !liveData.MoonrakerEnabled) return;
        const url = new URL("/printer/objects/query?print_stats", liveData.MoonrakerURL);
        try {
            const response = await fetch(url.href);
            const json = await response.json();
        } catch (e) {
        }
    }, 1000)
</script>
{moonrakerEnabled}
{Date.now()}