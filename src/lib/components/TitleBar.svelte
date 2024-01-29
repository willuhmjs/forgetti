<script lang="ts">
	import Fa from 'svelte-fa';
	import { send } from '$lib/wsClient';
	import { faPowerOff, faSync, faPalette, faRotateRight, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
	import type { Config } from '$lib/types';
	import toast from "svelte-french-toast";
	import { socketStore } from '$lib/wsClient';
	import { onMount } from 'svelte';
	export let data: Config;
	let liveData: Config = { ...data };
	const colors = ['#f97316', '#ff0000', '#00ff00', '#0000ff'];
	let color = data.Hidden.BrandColor;
	let powerMenu: HTMLDivElement;


	const updateConfig = async (config: Partial<Config>) => {
		const res = await fetch('/api/configure', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(config)
		});
		const json = await res.json();
		if (!json.success && json.message) toast.error(json.message, {
			duration: 5000,
			position: 'bottom-right',
			style: [
				"background-color: var(--foreground);",
				"color: white",
			].join(""),
		});
		if (json.success) {
			liveData = { ...liveData, ...config };
		}
	};

	const cycleThemeColor = () => {
		color = colors[(colors.indexOf(color) + 1) % colors.length];
		updateConfig({
				Hidden: {
					BrandColor: color
				}
			})
		document.documentElement.style.setProperty('--brand', color);
	};

	$: updateRequested = false;
	const requestUpdate = () => {
		updateRequested = true;
		send(JSON.stringify({ purpose: 'update' }));
	}


	const openPowerWindow = () => {
		if (powerMenu) powerMenu.style.display = powerMenu!.style.display === 'none' ? 'block' : 'none';
	};

	const execCommand = (command: 'Shutdown' | 'Restart') => {
		fetch('/api/power', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ command })
		}).then(async response => {
			const json = await response.json();
			toast.success(json.message, {
				duration: 5000,
				position: 'bottom-right',
				style: [
						"background-color: var(--foreground);",
						"color: white",
				].join("")
			})
		})
	};

	onMount(() => {
		socketStore.subscribe((data) => {
			if (data?.purpose === 'logs') {
                if (data.toastable) {
                   updateRequested = false;
					toast[data.success ? "success" : "error"](data.message, {
						duration: 5000,
						position: 'bottom-right',
						style: [
							"background-color: var(--foreground);",
							"color: white",
						].join(""),
						
					})
                }
			}
		});
	});
</script>

<div class="titlebar">
	<h3 class="title">Forgetti</h3>
	<div class="buttons">
		<button id="color" on:click={cycleThemeColor}>
			<Fa icon={faPalette} />
		</button>
		<button id="update" on:click={requestUpdate}>
			<Fa icon={faSync} spin={updateRequested} color={updateRequested ? "var(--yellow)" : ""}/>
		</button>
		<button id="power" on:click={openPowerWindow}>
			<Fa icon={faPowerOff} />
		</button>
		<button on:click={() => updateConfig({ General: { ...liveData.General, Enabled: !liveData.General.Enabled}})}>
			<Fa icon={liveData.General.Enabled ? faStop : faPlay} />
		</button>
	</div>
	<div class="power-menu" bind:this={powerMenu}>
		<button on:click={() => execCommand('Shutdown')}
			><Fa icon={faPowerOff} class="pm-icon" />Shutdown</button
		>
		<button on:click={() => execCommand('Restart')}
			><Fa icon={faRotateRight} class="pm-icon" />Restart</button
		>
	</div>
</div>
<style>
	.titlebar {
		position: relative;
		max-width: 100%;
		background-color: var(--foreground);
		padding: 1rem;
		margin: 0;
		display: flex;
		justify-content: space-between;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		font-size: 18px;
	}

	.title {
		margin: 0;
	}

	.buttons button {
		all: unset;
		margin-left: 1rem;
	}

	.buttons button:hover {
		cursor: pointer;
		filter: brightness(0.85);
	}

	.buttons #power {
		color: var(--red);
	}

	.buttons #color {
		color: var(--brand);
	}

	.power-menu {
		position: absolute;
		top: 100%;
		right: 0;
		background-color: var(--foreground);
		min-width: 160px;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		z-index: 1;
		border-bottom-left-radius: 15px;
		display: none;
	}
	.power-menu button {
		color: inherit;
		padding: 0.75rem 1rem;
		text-decoration: none;
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		font-size: 15px;
	}

	.power-menu button:last-child {
		border-bottom-left-radius: 15px;
	}

	.power-menu button:hover {
		background-color: var(--brand);
		cursor: pointer;
	}

	:global(.pm-icon) {
		margin-right: 0.5rem;
	}
</style>
