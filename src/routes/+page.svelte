<script>
	import { onMount } from 'svelte';
	import LivePreview from '$lib/components/LivePreview.svelte';
	import System from '$lib/components/System.svelte';
	import Window from '$lib/components/Window.svelte';
	import { faVideoCamera, faServer } from '@fortawesome/free-solid-svg-icons';
	export let data;
	
	onMount(() => {
		document.documentElement.style.setProperty('--brand', data.BrandColor);
	});
</script>

<div class="window-container">
	<Window title="Camera" icon={faVideoCamera}>
		<LivePreview {data} />
	</Window>

	<Window title="System" icon={faServer}>
		<System />
	</Window>
</div>

<style>
	.window-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-start;
		padding: 10px;
	}
</style>