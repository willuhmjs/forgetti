<script lang="ts">
    import Fa from "svelte-fa";
    import { faCaretDown, faCaretLeft, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
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
    <div class="content" style="{minimized ? 'visibility: hidden; height: 0;' : ''}">
        <slot></slot>
    </div>
</div>

<style>
    .window {
        width: fit-content;
        border: none;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        background-color: #fff;
        font-size: 12px;
        background-color: var(--foreground);

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
        background-color: var(--brand-dark);   

    }

    .title-icon {
        margin-right: 13px;
        color: var(--brand);
    }
</style>