<script lang="ts">
    export let text: string = '';
    export let delay: number = 500;

    let show = false;
    let timer: ReturnType<typeof setTimeout>;

    const handleMouseEnter = () => {
        timer = setTimeout(() => {
            show = true;
        }, delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(timer);
        show = false;
    };
</script>

<div
    role="tooltip"
    aria-roledescription="tooltip"
    class="tooltip-container"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <slot></slot>
    {#if show}
        <div class="tooltip">{text}</div>
    {/if}
</div>

<style>
    .tooltip-container {
        position: relative;
        display: inline-block;
    }
    .tooltip {
        position: absolute;
        bottom: 100%;
        left: 100%;
        background-color: black;
        color: white;
        padding: 0.5rem;
        font-size: x-small;
        border-radius: 0.25rem;
        white-space: nowrap;
        z-index: 1;
        opacity: 0.8;
    }
</style>
