<script lang="ts">
  import { faDiscord, faSailboat } from '@fortawesome/free-brands-svg-icons';
  import { faCog, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import { fly } from 'svelte/transition';
  import type { Config, ConfigUpdateRequestPacket, ConfigUpdateResponsePacket } from '$lib/types';
  import colorStore from '$lib/colorStore';
  import colorMap from '$lib/colorMap';
  import toast from 'svelte-french-toast';

  interface Props {
    liveDataUnsaved: Config;
    updateConfigToastable: (config: Partial<Config>) => Promise<void>;
    liveData: Config;
  }

  let { liveDataUnsaved = $bindable(), updateConfigToastable, liveData = $bindable() }: Props = $props();

  const updateConfig = async (config: Partial<Config>) => {
    return new Promise((resolve, reject) => {
      fetch('/api/update_config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purpose: 'configUpdate',
          config
        } as ConfigUpdateRequestPacket)
      }).then(async (response) => {
        const data = (await response.json()) as ConfigUpdateResponsePacket;
        if (data.type === 'success') {
          liveData = { ...liveData, ...data.config };
          liveDataUnsaved = { ...liveData }; // Update liveDataUnsaved with the new liveData
          resolve(data.message);
        } else {
          reject(data.message);
        }
      });
    });
  };

  const showToastForConfigUpdate = async (config: Partial<Config>) => {
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
</script>

<div class="window-container">
  <Window title="General" icon={faCog}>
    <div class="form">
      <div class="inputGroup">
        <label for="CameraURL">Camera URL</label>
        <input
          type="text"
          id="CameraURL"
          bind:value={liveDataUnsaved.CameraURL}
          placeholder="http://yourcameraurl.com"
        />
      </div>
      <div class="inputGroup">
        <label for="WebcamAuthEnabled">Webcam Authentication</label>
        <input
          type="checkbox"
          id="WebcamAuthEnabled"
          bind:checked={liveDataUnsaved.WebcamAuthEnabled}
        />
      </div>
      {#if liveDataUnsaved.WebcamAuthEnabled}
        <div class="inputGroup">
          <label for="CameraUsername">Username</label>
          <input
            type="text"
            id="CameraUsername"
            bind:value={liveDataUnsaved.CameraUsername}
            placeholder="admin"
          />
        </div>
        <div class="inputGroup">
          <label for="CameraPassword">Password</label>
          <input
            type="password"
            id="CameraPassword"
            bind:value={liveDataUnsaved.CameraPassword}
            placeholder="password"
          />
        </div>
      {/if}
      <div class="inputGroup">
        <label for="ConfidenceThreshold"
          >Confidence Threshold ({liveDataUnsaved.ConfidenceThreshold}%)</label
        >
        <input
          type="range"
          id="ConfidenceThreshold"
          min="1"
          max="100"
          bind:value={liveDataUnsaved.ConfidenceThreshold}
        />
      </div>
      <div class="inputGroup">
        <label for="MaxCPU"
          >CPU Threshold ({liveDataUnsaved.MaxCPU}%)</label
        >
        <input
          type="range"
          id="MaxCPU"
          min="1"
          max="100"
          bind:value={liveDataUnsaved.MaxCPU}
        />
      </div>
      <div class="inputGroup">
        <label for="ReportCooldown">Report Cooldown</label>
        <input
          type="text"
          id="ReportCooldown"
          bind:value={liveDataUnsaved.ReportCooldown}
          placeholder="5 minutes"
        />
      </div>
      <div class="inputGroup">
        <label for="Model">Model</label>
        <select id="Model" bind:value={liveDataUnsaved.Model}>
          <option value="nano" selected>Nano</option>
          <option value="small">Small</option>
        </select>
      </div>
  </Window>

  <Window title="Discord" icon={faDiscord}>
    <div class="form">
      <div class="inputGroup">
        <label for="DiscordWebhookEnabled">Enabled</label>
        <input
          type="checkbox"
          id="DiscordWebhookEnabled"
          bind:checked={liveDataUnsaved.DiscordWebhookEnabled}
        />
      </div>
      {#if liveDataUnsaved.DiscordWebhookEnabled}
        <div class="inputGroup">
          <label for="DiscordWebhookURL">Webhook URL</label>
          <input
            type="text"
            id="DiscordWebhookURL"
            bind:value={liveDataUnsaved.DiscordWebhookURL}
            placeholder="https://discord.com/api/webhooks/yourwebhookid/yourwebhooktoken"
          />
        </div>
        <div class="inputGroup">
          <label for="DiscordUserPingEnabled">Ping User</label>
          <input
            type="checkbox"
            id="DiscordUserPingEnabled"
            bind:checked={liveDataUnsaved.DiscordUserPingEnabled}
          />
        </div>
        {#if liveDataUnsaved.DiscordUserPingEnabled}
          <div class="inputGroup">
            <label for="DiscordUserPing">Ping User ID</label>
            <input
              type="text"
              id="DiscordUserPing"
              bind:value={liveDataUnsaved.DiscordUserPing}
              placeholder="969629831300005918"
            />
          </div>
        {/if}
      {/if}
    </div>
  </Window>

  <Window title="Moonraker" icon={faSailboat}>
    <div class="form">
      <div class="inputGroup">
        <label for="MoonrakerEnabled">Enabled</label>
        <input
          type="checkbox"
          id="MoonrakerEnabled"
          bind:checked={liveDataUnsaved.MoonrakerEnabled}
        />
      </div>
      {#if liveDataUnsaved.MoonrakerEnabled}
        <div class="inputGroup">
          <label for="MoonrakerURL">Moonraker URL</label><input
            type="text"
            id="MoonrakerURL"
            bind:value={liveDataUnsaved.MoonrakerURL}
            placeholder="http://yourmoonrakerurl.com"
          />
        </div>
        <div class="inputGroup">
          <label for="MoonrakerPauseThreshold"
            >Pause Threshold ({liveDataUnsaved.MoonrakerPauseThreshold}%)</label
          >
          <input
            type="range"
            id="MoonrakerPauseThreshold"
            min={liveDataUnsaved.ConfidenceThreshold}
            max="100"
            bind:value={liveDataUnsaved.MoonrakerPauseThreshold}
          />
        </div>
      {/if}
    </div>
  </Window>
</div>

<!-- only show if liveconfig differs from data -->
{#if JSON.stringify(liveData) !== JSON.stringify(liveDataUnsaved)}
  <div class="saveButtonDiv">
    <button
      onclick={() => showToastForConfigUpdate(liveDataUnsaved)}
      class="saveButton"
      transition:fly={{ y: 100 }}
    >
      <Fa fw icon={faFloppyDisk} />
    </button>
  </div>
{/if}

<style>
  .window-container {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 10px;
  }

  .form {
    width: 350px;
    max-width: 350px;
    margin: auto;
    padding: 20px;

    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .inputGroup {
    margin-bottom: 20px;
  }

  .inputGroup label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
    color: #ddd;
    font-size: 14px;
  }

  .inputGroup input[type='text'],
  .inputGroup input[type='password'],
  .inputGroup select {
    width: 100%;
    padding: 10px;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #333;
    color: #ddd;
    font-size: 16px;
  }

  .inputGroup input[type='text']:focus,
  .inputGroup input[type='password']:focus,
  .inputGroup select:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow: 0 0 8px var(--brand);
  }

  .inputGroup select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="#ddd" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
  }

  .inputGroup input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background-color: #333;
    outline: none;
    cursor: pointer;
    vertical-align: middle;
    border: 1px solid #666;
    margin-left: 0;
  }

  .inputGroup input[type='checkbox']:checked {
    background-color: var(--brand);
    border-color: var(--brand);
  }

  .saveButtonDiv {
    position: fixed;
    left: 0;
    bottom: 0;
    overflow: hidden;
  }

  .saveButton {
    background-color: var(--brand);
    color: white;
    bottom: none;
    border-radius: 50%;
    padding: 0.8rem;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    margin-left: 1rem;
  }

  .saveButton:hover {
    cursor: pointer;
    filter: brightness(0.85);
  }
</style>
