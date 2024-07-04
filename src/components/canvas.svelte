<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let color: string;
    export let background = 'none';
    export let canvasId: string;
    export let handleCanvasChange: (key: string, value: string) => void;
    export let savedDataURL: string;

    let width: number;
    let height: number;

    let canvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;
    let start: { x: number; y: number } = { x: 0, y: 0 };
    let isDrawing = false;
    let wasChanged = false;

    const handleStart = (x: number, y: number) => {
        if (!context || !canvas) return;

        if (color === background) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            isDrawing = true;
            start = { x, y };
            context.beginPath();
            context.moveTo(x, y);
            wasChanged = true;
        }
    };

    const handleEnd = () => {
        isDrawing = false;
    };

    const handleMouseLeave = () => {
        handleEnd();

        if (wasChanged && canvas) {
            const dataURL = canvas.toDataURL('image/png');
            handleCanvasChange(canvasId, dataURL);
            wasChanged = false;
        }
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

    const loadCanvasState = () => {
        if (savedDataURL) {
            const img = new Image();
            img.src = savedDataURL;
            img.onload = () => {
                if (!context) return;
                context.drawImage(img, 0, 0);
            };
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
            loadCanvasState();

            canvas.addEventListener('mousedown', handleMouseStart);
            canvas.addEventListener('touchstart', handleTouchStart);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('touchmove', handleTouchMove);
            canvas.addEventListener('mouseup', handleEnd);
            canvas.addEventListener('touchend', handleEnd);
            canvas.addEventListener('mouseleave', handleMouseLeave);
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
            canvas.removeEventListener('mouseleave', handleMouseLeave);

            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    });

    $: color, background, setStroke();
    $: savedDataURL, loadCanvasState();
</script>

<canvas
    {width}
    {height}
    style={`background: ${background};`}
    bind:this={canvas}
/>
