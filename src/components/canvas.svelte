<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    import { TOOLS } from '../utils/constants';
    import { get } from 'svelte/store';

    export let paletteColor: string;
    export let background = 'none';
    export let canvasId: string;
    export let savedDataURL: string;
    export let toolType: TOOLS;
    export let handleCanvasChange: (key: string, value: string) => void;

    let width: number;
    let height: number;

    let canvas: HTMLCanvasElement | null = null;
    let context: CanvasRenderingContext2D | null = null;
    let start: { x: number; y: number } = { x: 0, y: 0 };
    let isDrawing = false;
    let wasChanged = false;

    const getToolClass = (tool: TOOLS) => {
        switch (tool) {
            case TOOLS.ERASER:
                return 'cursor-eraser';
            case TOOLS.PEN:
                return 'cursor-pen';
            case TOOLS.TEXT:
                return 'cursor-text';
            default:
                return '';
        }
    };

    const handleStart = (x: number, y: number) => {
        if (!context || !canvas) return;

        const handleEraserStart = (x: number, y: number) => {
            if (!context || !canvas) return;

            // context.clearRect(x, y, 10, 10); when size of eraser is added to the pallet.
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        const handleTextStart = (x: number, y: number) => {
            if (!context) return;

            const text = prompt('Enter your text:');

            if (text) {
                context.font = '10px Arial';
                context.fillText(text, x, y);
            }
        };

        const handlePenStart = (x: number, y: number) => {
            if (!context) return;

            isDrawing = true;
            start = { x, y };
            context.beginPath();
            context.moveTo(x, y);
        };

        switch (toolType) {
            case TOOLS.ERASER:
                handleEraserStart(x, y);
                break;
            case TOOLS.TEXT:
                handleTextStart(x, y);
                break;
            default:
                handlePenStart(x, y);
        }

        wasChanged = true;
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
            context.strokeStyle = paletteColor;
        }
    };

    const loadCanvasState = () => {
        if (savedDataURL != '') {
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
                context.strokeStyle = paletteColor;
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

    $: paletteColor, background, setStroke();
    $: savedDataURL, loadCanvasState();
</script>

<canvas
    {width}
    {height}
    class={getToolClass(toolType)}
    style={`background: ${background}; color:${paletteColor}`}
    bind:this={canvas}
/>

<style>
    .cursor-eraser {
        cursor: url('/eraser.svg'), pointer;
    }

    .cursor-pen {
        cursor:
            url('/pen.svg') 2 10,
            pointer;
    }

    .cursor-text {
        cursor: text;
    }
</style>
