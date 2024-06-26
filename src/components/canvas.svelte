<script lang="ts">
    import { onMount } from 'svelte';

    export let className = 'background-color: none';
    export let color = 'black';
    export let background = 'white';

    let canvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;
    let start: { x: number; y: number } = { x: 0, y: 0 };
    let isDrawing = false;

    const handleStart = (x: number, y: number) => {
        if (!context || !canvas) return;

        if (color === background) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            isDrawing = true;
            start = { x, y };
        }
    };

    const handleEnd = () => {
        isDrawing = false;
    };

    const handleMove = (x: number, y: number) => {
        if (!context || !isDrawing) return;

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(x, y);
        context.stroke();

        start = { x, y };
    };

    const handleMouseStart = (event: MouseEvent) => {
        handleStart(event.offsetX, event.offsetY);
    };

    const handleTouchStart = (event: TouchEvent) => {
        if (!canvas) return;
        const touch = event.touches[0];
        const { left, top } = canvas.getBoundingClientRect();
        handleStart(touch.clientX - left, touch.clientY - top);
    };

    const handleMouseMove = (event: MouseEvent) => {
        handleMove(event.offsetX, event.offsetY);
    };

    const handleTouchMove = (event: TouchEvent) => {
        if (!canvas) return;
        const touch = event.touches[0];
        const { left, top } = canvas.getBoundingClientRect();
        handleMove(touch.clientX - left, touch.clientY - top);
    };

    onMount(() => {
        if (canvas) {
            context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = color;
            }
        }
    });

    $: if (context) {
        context.strokeStyle = color;
    }
</script>

<canvas
    class={className}
    bind:this={canvas}
    on:mousedown={handleMouseStart}
    on:touchstart={handleTouchStart}
    on:mouseup={handleEnd}
    on:touchend={handleEnd}
    on:mouseleave={handleEnd}
    on:mousemove={handleMouseMove}
    on:touchmove={handleTouchMove}
/>
