<script lang="ts">
  import Fa from 'svelte-fa';
  import { faHome, faCogs, faFileLines, faPlay, faStop, faPalette, faSync, faPowerOff, faRotateRight } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import toast from 'svelte-french-toast';
  import colorStore from '$lib/colorStore';
  import colorMap from '$lib/colorMap';
  import { socketStore } from '$lib/wsClient';

  let {
    liveData,
    updateConfigToastable,
    cycleThemeColor,
    requestUpdate,
    execCommand,
    lowPowerMode = $bindable()
  } = $props();

  let powerMenu: HTMLDivElement = $state();
  let updateRequested = $state(false);
  let activeWindow: 'home' | 'config' | 'logs' = $state('home');

  const openPowerWindow = () => {
    if (powerMenu) powerMenu.style.display = powerMenu.style.display === 'none' ? 'block' : 'none';
  };

  onMount(() => {
    powerMenu.style.display = 'none';
    document.documentElement.style.setProperty('--brand', liveData.BrandColor);
    const colorValue = colorMap.get(liveData.BrandColor);
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

{#if lowPowerMode}
  <div class="low-power-banner">
    <p>Low Power Mode Enabled</p>
  </div>
{/if}

<div class="titlebar">
  <h3 class="title">Forgetti</h3>
  <div class="buttons">
    <button onclick={() => (activeWindow = 'home')}>
      <Fa icon={faHome} fw={true} color={activeWindow === 'home' ? 'var(--brand)' : ''} />
    </button>
    <button onclick={() => (activeWindow = 'config')}>
      <Fa icon={faCogs} fw={true} color={activeWindow === 'config' ? 'var(--brand)' : ''} />
    </button>
    <button onclick={() => (activeWindow = 'logs')}>
      <Fa icon={faFileLines} fw={true} color={activeWindow === 'logs' ? 'var(--brand)' : ''} />
    </button>
  </div>
  <div class="buttons">
    <button onclick={() => updateConfigToastable({ Enabled: !liveData.Enabled })}>
      <Fa icon={liveData.Enabled ? faStop : faPlay} color={liveData.Enabled ? 'var(--red)' : 'var(--green)'} />
    </button>
    <button id="color" onclick={cycleThemeColor}>
      <Fa icon={faPalette} />
    </button>
    <button id="update" onclick={requestUpdate}>
      <Fa icon={faSync} spin={updateRequested} color="var(--yellow)" />
    </button>
    <button id="power" onclick={openPowerWindow}>
      <Fa icon={faPowerOff} />
    </button>
  </div>
  <div class="power-menu" bind:this={powerMenu}>
    <button onclick={() => execCommand('Shutdown')}>
      <Fa icon={faPowerOff} class="pm-icon" />Shutdown
    </button>
    <button onclick={() => execCommand('Restart')}>
      <Fa icon={faRotateRight} class="pm-icon" />Restart
    </button>
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

  button {
    all: unset;
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
    box-sizing: border-box;
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
