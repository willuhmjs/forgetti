<script>
	import '../app.pcss';
	import { Toaster } from 'svelte-french-toast';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app-shell">
	{@render children?.()}
</div>
<Toaster />

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		width: 100%;
	}
</style>
