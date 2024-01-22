<script>
    import Config from '$lib/components/Config.svelte';
    import LivePreview from '$lib/components/LivePreview.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
    import Window from '$lib/components/Window.svelte';
    import { faCog, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
    export let data;
</script>

<style>
    .window-container {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: flex-start; 
        padding: 10px;
    }
</style>

<div class="desktop">
    <TitleBar />
    <div class="window-container">
        <Window title="Camera" icon={faVideoCamera}>
            <LivePreview />
        </Window>

        <Window title="Configuration" icon={faCog}>
            <Config {data} />
        </Window>
    </div>
</div>