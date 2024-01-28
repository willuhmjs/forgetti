<script>
	import { onMount } from 'svelte';
	import Config from '$lib/components/Config.svelte';
	import LivePreview from '$lib/components/LivePreview.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import System from '$lib/components/System.svelte';
	import Window from '$lib/components/Window.svelte';
	import Logs from "$lib/components/Logs.svelte";
	import { Toaster } from "svelte-french-toast";
	import { faCog, faVideoCamera, faServer } from '@fortawesome/free-solid-svg-icons';
	export let data;

	
	onMount(() => {
		document.documentElement.style.setProperty('--brand', data.Hidden.BrandColor);
	});
</script>

<div class="desktop">
	<TitleBar {data} />
	<div class="window-container">
		<Window title="Camera" icon={faVideoCamera}>
			<LivePreview {data} />
		</Window>

		<Window title="Configuration" icon={faCog}>
			<Config {data} />
		</Window>

		<Window title="System" icon={faServer}>
			<System />
		</Window>

		<Window title="Logs" icon={faServer}>
			<Logs />
		</Window>
	</div>
</div>
<Toaster />
<style>
	:global(body) {
		font-family: sans-serif;
		background-color: var(--background);
		color: #f9fafb;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(:root) {
		--foreground: #18181b;
		--background: #27272a;
		--red: #f90016;
		--green: green;
		--yellow: yellow;
	}

	.window-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-start;
		padding: 10px;
	}
</style>
