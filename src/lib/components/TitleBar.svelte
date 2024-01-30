<script lang="ts">
	import Fa from 'svelte-fa';
	import { send } from '$lib/wsClient';
	import { faPowerOff, faSync, faPalette, faRotateRight, faPlay, faStop, faCogs, faFileLines, faHome } from '@fortawesome/free-solid-svg-icons';
	import type { Config } from '$lib/types';
	import toast from "svelte-french-toast";
	import { socketStore } from '$lib/wsClient';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	export let data: Config;
	let liveData: Config = { ...data };
	const colors = ['var(--orange)', 'var(--red)', 'var(--green)', 'var(--blue)'];
	let color = data.BrandColor;
	let powerMenu: HTMLDivElement;

	$: slug = $page.url.pathname;

	const updateConfig = async (config: Partial<Config>) => {
		send(JSON.stringify({ purpose: 'configUpdate', config }));
	};

	const cycleThemeColor = () => {
		color = colors[(colors.indexOf(color) + 1) % colors.length];
		updateConfig({
				BrandColor: color
			})
		document.documentElement.style.setProperty('--brand', color);
	};

	$: updateRequested = false;
	const requestUpdate = () => {
		updateRequested = true;
		send(JSON.stringify({ purpose: 'appUpdate' }));
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
			if (!data) return;
			if (data.purpose === 'appUpdate' || data.purpose === 'configUpdate') {
                if (data.toastable) {
                   updateRequested = false;
					toast[data.type](data.message, {
						duration: 5000,
						position: 'bottom-right',
						style: [
							"background-color: var(--foreground);",
							"color: white",
						].join(""),
						
					})
                }
			}
			if (data.purpose === 'configUpdate' && data.config) {
				liveData = { ...liveData, ...data.config };
			}
		});
	});
</script>

<div class="titlebar">
	<h3 class="title">Forgetti</h3>
	<div class="buttons">
		<a href="/">
			<Fa icon={faHome} fw={true} color={slug === "/" ? liveData.BrandColor : ""}/>
		</a>
		<a href="/configure">
			<Fa icon={faCogs} fw={true} color={slug === "/configure" ? liveData.BrandColor : ""} />
		</a>
		<a href="/logs">
			<Fa icon={faFileLines} fw={true} color={slug === "/logs" ? liveData.BrandColor : ""} />
		</a>
	</div>
	<div class="buttons">
		<button on:click={() => updateConfig({ Enabled: !liveData.Enabled })}>
			<Fa icon={liveData.Enabled ? faStop : faPlay} color={liveData.Enabled ? "var(--red)" : "var(--green)"}/>
		</button>
		<button id="color" on:click={cycleThemeColor}>
			<Fa icon={faPalette} />
		</button>
		<button id="update" on:click={requestUpdate}>
			<Fa icon={faSync} spin={updateRequested} color="var(--yellow)"/>
		</button>
		<button id="power" on:click={openPowerWindow}>
			<Fa icon={faPowerOff} />
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

	.buttons {
		display: flex;
		gap: 1rem;
	}

	.buttons button, .buttons a {
		all: unset;
	}

	.buttons button:hover, .buttons a:hover {
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
