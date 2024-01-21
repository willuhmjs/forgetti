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
        <h2><span class="title-icon"><Fa {icon} /></span>{title}</h2>
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
        border: 1px solid transparent;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        background-color: #fff;
        font-size: 12px;
        background-color: #18181b;

    }

    .title-bar {
        background-color: #18181b;
        padding: 5px;
        display: flex;
        justify-content: space-between;
        padding: 0px 15px;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;


    }
    .content {
        width: 100%;
        margin-bottom: -4px;
    }


    .title-button {
        all: unset;
        font-size: 1.4rem; 
        margin-left: 10px;
    }

    .title-icon {
        margin-right: 13px;
        color: #f97316;
    }
</style>