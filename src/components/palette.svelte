<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { colors, CUSTOM_COLOR_EVENT, TOOLS } from '../utils/constants';

    export let paletteColor = colors[0];
    export let background = 'none';
    export let changeTool: (tool: TOOLS) => void;

    let isColorsPanelOpen = false;

    const toggleColorsPanel = () => {
        isColorsPanelOpen = !isColorsPanelOpen;
    };

    const dispatch = createEventDispatcher();

    const handleColorClick = (color: string) => {
        dispatch(CUSTOM_COLOR_EVENT, { color });
        paletteColor = color;

        toggleColorsPanel();

        changeTool(TOOLS.PEN);
    };

    const handleEraserClick = () => {
        dispatch(CUSTOM_COLOR_EVENT, { color: background });
        paletteColor = background;

        changeTool(TOOLS.ERASER);
    };
</script>

<section>
    <button on:click={handleEraserClick} style:background>
        <span class="visually-hidden">
            Select the background color to clear the canvas
        </span>
    </button>

    <div class="color-panel">
        <button on:click={toggleColorsPanel}>
            <svg style:color={paletteColor} id="drop" viewBox="-50 -50 100 100">
                <g
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="0"
                    stroke-linecap="round"
                >
                    <path
                        d="M -38 12 a 38 38 0 0 0 76 0 q 0 -28 -38 -62 -38 34 -38 62"
                    />
                </g>
            </svg>
        </button>
        {#if isColorsPanelOpen}
            <div class="flex-row">
                {#each colors as color}
                    <button
                        on:click={() => handleColorClick(color)}
                        style:background={color}
                    >
                        <span class="visually-hidden">
                            Select the color {color}
                        </span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</section>

<style>
    section {
        --size: 1.75rem;
        padding: 0.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: fixed;
        bottom: 2rem;
        left: 1rem;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    section > div {
        flex-grow: 1;
    }

    svg {
        flex-shrink: 0;
    }

    div {
        display: flex;
        gap: 0 0.5rem;
        align-items: center;
        overflow-x: auto;
    }

    div button {
        flex-shrink: 0;
    }

    button {
        width: var(--size);
        height: var(--size);
    }

    button {
        cursor: pointer;
        border-radius: 50%;
        margin: 0;
    }
</style>
