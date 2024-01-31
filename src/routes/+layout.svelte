<script>
	import { onMount } from 'svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { Toaster } from "svelte-french-toast";
	export let data;

	
	onMount(() => {
		document.documentElement.style.setProperty('--brand', data.BrandColor);
	});
</script>

<div class="desktop">
	<TitleBar {data} />
	<slot />
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
		--red: #ef4444;
		--green: #22c55e;
		--yellow: #eab308;
		--orange: #f97316;
		--blue: #3b82f6;
	}

	
</style>
