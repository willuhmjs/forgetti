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
