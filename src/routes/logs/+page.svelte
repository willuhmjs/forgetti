<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const logs = writable<string[]>([]);

  onMount(async () => {
    const response = await fetch('/logs.txt');
    if (response.ok) {
      const text = await response.text();
      logs.set(text.split('\n'));
    } else {
      console.error('Failed to fetch logs');
    }
  });
</script>

<div class="logs">
  <h1>Saved Logs</h1>
  {#each $logs as log}
    <p>{log}</p>
  {/each}
</div>

<style>
  .logs {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--foreground);
    color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .logs h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .logs p {
    margin: 5px 0;
    padding: 10px;
    background-color: var(--background);
    border-radius: 4px;
  }
</style>
