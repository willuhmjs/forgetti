<script>
	import '../app.pcss';
	import { Toaster } from 'svelte-french-toast';
</script>

<div class="desktop">
	<slot />
</div>
<Toaster></Toaster>

<style>
	:global(body) {
		font-family: sans-serif;
		background-color: var(--background);
		color: #f9fafb;
		margin: 0;
		padding: 0;
	}

	:global(*) {
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
