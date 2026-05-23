<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	interface Props {
		title: string;
		message: string;
		confirmLabel?: string;
		danger?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let { title, message, confirmLabel = 'Confirm', danger = false, onconfirm, oncancel }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" transition:fade={{ duration: 150 }} onclick={oncancel}>
	<div class="dialog" transition:scale={{ start: 0.95, duration: 150 }} onclick={(e) => e.stopPropagation()}>
		<h3 class="dialog-title">{title}</h3>
		<p class="dialog-message">{message}</p>
		<div class="dialog-actions">
			<button class="btn btn-secondary" onclick={oncancel}>Cancel</button>
			<button class="btn" class:btn-danger={danger} class:btn-primary={!danger} onclick={onconfirm}>
				{confirmLabel}
			</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.dialog {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		max-width: 400px;
		width: 90%;
		box-shadow: var(--shadow-lg);
	}

	.dialog-title {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.dialog-message {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: 1.25rem;
		line-height: 1.5;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 600;
		transition: all var(--transition-fast);
	}

	.btn-secondary {
		background-color: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.btn-secondary:hover {
		background-color: var(--bg-hover);
		color: var(--text-primary);
	}

	.btn-primary {
		background-color: var(--brand);
		color: white;
	}

	.btn-primary:hover {
		filter: brightness(1.1);
	}

	.btn-danger {
		background-color: var(--red);
		color: white;
	}

	.btn-danger:hover {
		filter: brightness(1.1);
	}
</style>
