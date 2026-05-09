<script lang="ts">
	import Fa from 'svelte-fa';
	import { faCaretDown, faCaretLeft, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	interface Props {
		title: string;
		icon: IconDefinition;
		children?: import('svelte').Snippet;
		buttons?: import('svelte').Snippet;
	}

	let { title, icon, children, buttons }: Props = $props();
	let minimized = $state(false);

	function toggleMinimize() {
		minimized = !minimized;
	}
</script>

<div class="window">
	<div class="title-bar">
		<h2 class="title"><span class="title-icon"><Fa {icon} /></span>{title}</h2>
		<div class="buttons">
		{@render buttons?.()}
		<button onclick={toggleMinimize} class="button button--icon title-button">
			{#if minimized}
				<Fa icon={faCaretLeft} />
			{:else}
				<Fa icon={faCaretDown} />
			{/if}
		</button>
		</div>
	</div>
	<div class="content">
		{#if !minimized}
			{@render children?.()}
		{/if}
	</div>
</div>

<style>
	.window {
		border-radius: var(--radius-lg);
		background-color: var(--surface);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-soft);
		display: flex;
		flex-direction: column;
		min-width: 280px;
	}

	.title-bar {
		background-color: var(--surface-2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--border);
		border-top-left-radius: var(--radius-lg);
		border-top-right-radius: var(--radius-lg);
	}
	.content {
		width: 100%;
		display: flex;
		justify-content: center;
		overflow-y: hidden;
		align-items: center;
		flex-grow: 1;
		padding: 1rem;
	}

	.title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: var(--text-strong);
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title-button {
		font-size: 1.05rem;
		background: var(--surface-3);
		border-color: rgba(148, 163, 184, 0.3);
		color: var(--text);
	}

	.title-button:hover {
		background: var(--surface-3);
	}

	.title-icon {
		color: var(--brand);
	}

	@media screen and (max-width: 576px) {
		.window {
			width: 100%;
		}
	}
</style>
