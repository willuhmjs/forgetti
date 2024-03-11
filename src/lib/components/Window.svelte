<script lang="ts">
	import Fa from 'svelte-fa';
	import { faCaretDown, faCaretLeft, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	export let title: string;
	export let icon: IconDefinition;
	let minimized = false;

	function toggleMinimize() {
		minimized = !minimized;
	}
</script>

<div class="window">
	<div class="title-bar">
		<h2 class="title"><span class="title-icon"><Fa {icon} /></span>{title}</h2>
		<button on:click={toggleMinimize} class="title-button">
			{#if minimized}
				<Fa icon={faCaretLeft} />
			{:else}
				<Fa icon={faCaretDown} />
			{/if}
		</button>
	</div>
	<div class="content">
		{#if !minimized}
			<slot />
		{/if}
	</div>
</div>

<style>
	.window {
		border: none;
		border-radius: 15px;
		background-color: #fff;
		font-size: 12px;
		background-color: var(--foreground);
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		max-width: 100%;
	}

	.title-bar {
		background-color: var(--foreground);
		display: flex;
		justify-content: space-between;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
	}
	.content {
		width: 100%;
		display: flex;
		justify-content: center;
		overflow-y: hidden;
		align-items: center;
	}

	.title {
		margin-left: 15px;
	}

	.title-button {
		all: unset;
		font-size: 1.4rem;
		margin-left: 10px;
		padding: 0.25rem 1rem;
		background-color: var(--brand);
		border-top-right-radius: 15px;
	}

	.title-button:hover {
		cursor: pointer;
		filter: brightness(0.85);
	}

	.title-icon {
		margin-right: 13px;
		color: var(--brand);
	}

	@media screen and (max-width: 576px) {
		.window {
			width: 100%;
		}
	}
</style>
