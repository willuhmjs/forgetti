<script lang="ts">
	import Config from '$lib/components/Config.svelte';
    import LivePreview from '$lib/components/LivePreview.svelte';
	import Window from '$lib/components/Window.svelte';
	import { faCog, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
    export let data;

   
</script>

<Window title="Camera" icon={faVideoCamera}>
    <LivePreview />
</Window>

<Window title="Configuration" icon={faCog}>
    <Config {data} />
</Window>

