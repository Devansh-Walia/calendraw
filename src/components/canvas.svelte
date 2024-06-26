<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let color: string;
    export let background = 'none';

    let width: number;
    let height: number;

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
            context.beginPath();
            context.moveTo(x, y);
        }
    };

    const handleEnd = () => {
        isDrawing = false;
    };

    const handleMove = (x: number, y: number) => {
        if (!context || !isDrawing) return;

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

    const setStroke = () => {
        if (context) {
            context.strokeStyle = color;
        }
    };

    onMount(() => {
        if (canvas) {
            context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = color;
                context.lineWidth = 2;
            }

            const rect = canvas.parentElement?.getBoundingClientRect();
            height = rect?.height || 0;
            width = rect?.width || 0;

            setStroke();
        }
    });

    onDestroy(() => {
        if (canvas) {
            canvas.removeEventListener('mousedown', handleMouseStart);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('mouseup', handleEnd);
            canvas.removeEventListener('touchend', handleEnd);
            canvas.removeEventListener('mouseleave', handleEnd);
        }
    });

    $: color, background, setStroke();

    const onContextSave = () => {
        if (!canvas) return;
        const data = canvas.toDataURL();
        // Save the data to localStorage or perform other actions
    };

    const onContextLoad = (data: string) => {
        if (!canvas) return;
        const img = new Image();
        img.onload = () => {
            if (!context) return;
            context.drawImage(img, 0, 0);
        };
        img.src = data;
    };
</script>

<canvas
    {width}
    {height}
    style={`background: ${background};`}
    bind:this={canvas}
    on:mousedown={handleMouseStart}
    on:touchstart={handleTouchStart}
    on:mouseup={handleEnd}
    on:touchend={handleEnd}
    on:mouseleave={handleEnd}
    on:mousemove={handleMouseMove}
    on:touchmove={handleTouchMove}
/>
