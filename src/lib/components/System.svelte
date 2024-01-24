<script lang="ts">
    import { onMount } from 'svelte';
    import socketStore from "$lib/wsStore";
    import type { SystemInfo } from '$lib/types';
    import Fa from "svelte-fa";
    import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
    let socketData: SystemInfo;

    onMount(() => {
        socketStore.subscribe((data) => {
			if (data?.purpose === "system") {
                socketData = data
			}
		})
    })
</script>

{#if socketData}
    {JSON.stringify(socketData)}
{:else}
    <Fa icon={faRotateRight} spin />
{/if}