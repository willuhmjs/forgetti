<script lang="ts">
	import LivePreview from '$lib/components/LivePreview.svelte';
	import System from '$lib/components/System.svelte';
	import Moonraker from '$lib/components/Moonraker.svelte';
	import Window from '$lib/components/Window.svelte';
	import Logs from '$lib/components/Logs.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import ConfigForm from '$lib/components/ConfigForm.svelte';
	import { send, socketStore } from '$lib/wsClient';
	import type { Config } from '$lib/types';
	import toast from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import colorStore from '$lib/colorStore';
	import colorMap from '$lib/colorMap';
	interface Props {
		data: Config;
	}

	let { data }: Props = $props();
	let liveData: Config = $state({ ...data });
	let liveDataUnsaved: Config = $state({ ...data });
	const colors = ['var(--orange)', 'var(--red)', 'var(--green)', 'var(--blue)'];
	let color = data.BrandColor;
	let lp: LivePreview;

	let activeWindow: 'home' | 'config' | 'logs' = $state('home');
	const updateConfigToastable = async (config: Partial<Config>) => {
		toast.promise(
			updateConfig(config),
			{
				loading: 'Loading...',
				success: (data) => `${data}`,
				error: (err) => `${err.toString()}`
			},
			{
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			}
		);
	};

	const cycleThemeColor = () => {
		color = colors[(colors.indexOf(color) + 1) % colors.length];
		updateConfig({
			BrandColor: color
		});
		document.documentElement.style.setProperty('--brand', color);
		const colorValue = colorMap.get(color);
		if (colorValue) {
			colorStore.set(colorValue);
		}
	};

	let updateRequested = $state(false);
	
	const requestUpdate = () => {
		updateRequested = true;
		send(JSON.stringify({ purpose: 'appUpdate' }));
	};

	const execCommand = (command: 'Shutdown' | 'Restart') => {
		fetch('/api/power', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ command })
		}).then(async (response) => {
			const json = await response.json();
			toast.success(json.message, {
				duration: 5000,
				position: 'bottom-right',
				style: ['background-color: var(--foreground);', 'color: white'].join('')
			});
		});
	};

	let lowPowerMode = $state(false);

	onMount(() => {
		document.documentElement.style.setProperty('--brand', data.BrandColor);
		const colorValue = colorMap.get(color);
		if (colorValue) {
			colorStore.set(colorValue);
		}
		socketStore.subscribe((data) => {
			if (!data) return;
			if (data.purpose === 'appUpdate' && data.toastable) {
				updateRequested = false;
				toast[data.type](data.message, {
					duration: 5000,
					position: 'bottom-right',
					style: ['background-color: var(--foreground);', 'color: white'].join('')
				});
			} else if (data?.purpose === 'system') {
			lowPowerMode = data.lowPowerMode;
		}
		});
	
	});
</script>

<TitleBar {liveData} {updateConfigToastable} {cycleThemeColor} {requestUpdate} {execCommand} {lowPowerMode} />

{#if activeWindow === 'home'}
	<div class="window-container">
		<Window title="Camera" icon={faVideoCamera}>
			{#snippet buttons()}
				<button onclick={lp.clearCoordinates} class="title-button">
					<Fa icon={faTrash} />
				</button>
			{/snippet}
			<LivePreview {data} bind:this={lp} />
		</Window>

		<Window title="System" icon={faServer}>
			<System />
		</Window>

		<Window title="Moonraker" icon={faSailboat}>
			<Moonraker />
		</Window>
	</div>
{:else if activeWindow === 'config'}
	<ConfigForm {liveDataUnsaved} {updateConfigToastable} {liveData} />
{:else if activeWindow === 'logs'}
	<Logs />
{/if}

<style>
	.window-container {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-start;
		padding: 10px;
	}

	.title-button {
		all: unset;
		font-size: 1rem;
		margin-left: 10px;
		padding: 0.25rem 1rem;
		background-color: var(--brand);
		height: 100%;
	}

	.title-button:hover {
		cursor: pointer;
		filter: brightness(0.85);
	}

	.low-power-banner {
		background-color: var(--red);
		color: white;
		padding: 5px;
		text-align: center;
		font-weight: bold;
	}

	@media screen and (max-width: 576px) {
		.titlebar {
			flex-direction: column;
			align-items: center;
		}

		.buttons {
			margin-top: 1rem;
		}

		.buttons button {
			margin: 0;
		}
	}
</style>
