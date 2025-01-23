<script>
	import '../app.pcss';
	import { Toaster } from 'svelte-french-toast';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="desktop">
	{@render children?.()}
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

	nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	nav a {
		color: #f9fafb;
		text-decoration: none;
	}

	nav a:hover {
		text-decoration: underline;
	}
</style>
