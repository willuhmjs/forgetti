<script lang="ts">
	import Fa from 'svelte-fa';
	import { faChevronDown, faChevronRight, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import { slide } from 'svelte/transition';
	interface Props {
		title: string;
		icon: IconDefinition;
		children?: import('svelte').Snippet;
		buttons?: import('svelte').Snippet;
	}

	let { title, icon, children, buttons }: Props = $props();
	let minimized = $state(false);
</script>

<div class="window" class:minimized>
	<button class="title-bar" onclick={() => (minimized = !minimized)}>
		<div class="title-left">
			<span class="title-icon"><Fa {icon} /></span>
			<h3 class="title">{title}</h3>
		</div>
		<div class="title-right">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="title-actions" onclick={(e) => e.stopPropagation()}>
				{@render buttons?.()}
			</span>
			<span class="chevron">
				<Fa icon={minimized ? faChevronRight : faChevronDown} />
			</span>
		</div>
	</button>
	{#if !minimized}
		<div class="content" transition:slide={{ duration: 200 }}>
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	.window {
		background-color: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-subtle);
		overflow: hidden;
		transition: box-shadow var(--transition-normal);
	}

	.window:hover {
		box-shadow: var(--shadow-md);
	}

	.title-bar {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1rem;
		background-color: var(--bg-secondary);
		transition: background-color var(--transition-fast);
	}

	.title-bar:hover {
		background-color: var(--bg-tertiary);
	}

	.title-left {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.title-icon {
		color: var(--brand);
		font-size: 0.875rem;
	}

	.title {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.title-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.chevron {
		color: var(--text-muted);
		font-size: 0.75rem;
		transition: color var(--transition-fast);
	}

	.title-bar:hover .chevron {
		color: var(--text-secondary);
	}

	.content {
		padding: 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.title-actions :global(button) {
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-size: 0.75rem;
		transition: all var(--transition-fast);
	}

	.title-actions :global(button:hover) {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}
</style>
