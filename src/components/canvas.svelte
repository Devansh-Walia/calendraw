<script lang="ts">
    import { onDestroy, onMount } from 'svelte';

    import { toolCursors, TOOLS } from '../utils/constants';
    import type { Element, Point } from '../utils/types';

    export let id: string;
    export let state: string | undefined;
    export let handleCanvasChange: (id: string, data: string) => void;

    export let paletteColor: string;
    export let background = 'none';
    export let toolType: TOOLS;

    export let strokeWidth = 2;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let elements: Element[] = [];
    let undoStack: Element[] = [];
    let redoStack: Element[] = [];
    let currentElement: Element | null = null;
    let drawing = false;
    let dragging = false;
    let scale = 1;
    let dragStart: Point | null = null;

    let offsetX = 0;
    let offsetY = 0;

    function getMousePosition(event: MouseEvent | TouchEvent): {
        offsetX: number;
        offsetY: number;
    } {
        if (event instanceof TouchEvent) {
            const touch = event.touches[0];

            return {
                offsetX: (touch.clientX - offsetX) / scale,
                offsetY: (touch.clientY - offsetY) / scale,
            };
        }

        return {
            offsetX: (event.offsetX - offsetX) / scale,
            offsetY: (event.offsetY - offsetY) / scale,
        };
    }

    const isPointInElement = (
        x: number,
        y: number,
        element: Element,
    ): boolean => {
        let tolerance = 5;

        for (let i = 1; i < element.points.length; i++) {
            const p1 = {
                x: element.points[i - 1].x + element.position.x,
                y: element.points[i - 1].y + element.position.y,
            };
            const p2 = {
                x: element.points[i].x + element.position.x,
                y: element.points[i].y + element.position.y,
            };

            if (
                distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance
            ) {
                return true;
            }
        }

        return false;
    };

    const distanceToLineSegment = (
        x: number,
        y: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
    ): number => {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) {
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    function smoothFreehand(): void {
        if (!currentElement) return;

        const points = currentElement.points;
        if (points.length < 3) return;

        const lastIndex = points.length - 1;
        const prevIndex = lastIndex - 1;
        const p1 = points[prevIndex];
        const p2 = points[lastIndex];

        const midPointX = (p1.x + p2.x) / 2;
        const midPointY = (p1.y + p2.y) / 2;

        points[prevIndex] = { x: midPointX, y: midPointY };
    }

    const startInteraction = (e: MouseEvent | TouchEvent) => {
        const { offsetX: x, offsetY: y } = getMousePosition(e);

        if (toolType === TOOLS.HAND) {
            const clickedElement = elements.find((element) =>
                isPointInElement(x, y, element),
            );

            if (clickedElement) {
                if (!e.shiftKey) {
                    elements.forEach((el) => (el.selected = false));
                }
                clickedElement.selected = !clickedElement.selected;
                dragging = true;
                dragStart = { x, y };
            } else if (!e.shiftKey) {
                elements.forEach((el) => (el.selected = false));
            }
        } else {
            drawing = true;

            currentElement = {
                id: elements.length,
                type: toolType,
                points: [{ x, y }],
                strokeColor: paletteColor,
                strokeWidth,
                position: { x: 0, y: 0 },
                selected: false,
            };

            elements = [...elements, currentElement];
            redoStack = [];
        }

        redraw();
    };

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
        const { offsetX: x, offsetY: y } = getMousePosition(e);

        if (toolType === TOOLS.PEN && drawing && currentElement) {
            currentElement.points = [...currentElement.points, { x, y }];
            smoothFreehand();
            redraw();
        } else if (toolType === TOOLS.HAND && dragging && dragStart) {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            elements.forEach((el) => {
                if (el.selected) {
                    el.position.x += dx;
                    el.position.y += dy;
                }
            });

            dragStart = { x, y };
            redraw();
        }
    };

    const stopInteraction = (e: MouseEvent | TouchEvent) => {
        if (drawing && currentElement) {
            undoStack = [...undoStack, currentElement];
        }

        drawing = false;
        dragging = false;
        currentElement = null;
        dragStart = null;
    };

    function undo(): void {
        if (undoStack.length > 0) {
            const lastElement = undoStack.pop();
            if (lastElement) {
                redoStack = [...redoStack, lastElement];
                elements = elements.filter((el) => el.id !== lastElement.id);
                redraw();
            }
        }
    }

    function redo(): void {
        if (redoStack.length > 0) {
            const redoElement = redoStack.pop();
            if (redoElement) {
                undoStack = [...undoStack, redoElement];
                elements = [...elements, redoElement];
                redraw();
            }
        }
    }

    function clearCanvas(): void {
        elements = [];
        undoStack = [];
        redoStack = [];
        redraw();
    }

    function handleZoom(event: WheelEvent): void {
        event.preventDefault();
        const zoomAmount = event.deltaY * -0.01;
        const newScale = scale + zoomAmount;
        if (newScale > 0.1 && newScale < 10) {
            scale = newScale;
            redraw();
        }
    }

    const redraw = () => {
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(offsetX, offsetY);
        context.scale(scale, scale);

        elements.forEach((element) => {
            if (element.type === TOOLS.PEN) {
                context.strokeStyle = element.strokeColor;
                context.lineWidth = element.strokeWidth;
                context.lineCap = 'round';

                context.beginPath();

                element.points.forEach((point, index) => {
                    const x = point.x + element.position.x;
                    const y = point.y + element.position.y;
                    if (index === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                });

                context.stroke();

                if (element.selected) {
                    context.strokeStyle = 'blue';
                    context.lineWidth = 2;
                    context.setLineDash([5, 5]);
                    context.beginPath();

                    context.strokeRect(
                        element.position.x +
                            Math.min(...element.points.map((p) => p.x)) -
                            5,
                        element.position.y +
                            Math.min(...element.points.map((p) => p.y)) -
                            5,
                        Math.max(...element.points.map((p) => p.x)) -
                            Math.min(...element.points.map((p) => p.x)) +
                            10,
                        Math.max(...element.points.map((p) => p.y)) -
                            Math.min(...element.points.map((p) => p.y)) +
                            10,
                    );

                    context.stroke();
                    context.setLineDash([]);
                }
            }
        });

        handleCanvasChange(id, JSON.stringify({ elements }));
        context.restore();
    };

    onMount(() => {
        context = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (state) {
            const data = JSON.parse(state);

            elements = data?.elements as Element[];
            redraw();
        }

        canvas.addEventListener('mousemove', redraw);
    });

    onDestroy(() => {
        handleCanvasChange(id, JSON.stringify({ elements }));
    });
</script>

<canvas
    class={toolCursors[toolType]}
    style={`background: ${background}; color: ${paletteColor}`}
    bind:this={canvas}
    on:mousedown={startInteraction}
    on:mouseup={stopInteraction}
    on:mousemove={handleInteraction}
    on:contextmenu={(e) => e.preventDefault()}
    on:touchstart={startInteraction}
    on:touchend={stopInteraction}
    on:touchmove={handleInteraction}
    on:touchcancel={stopInteraction}
    on:wheel={handleZoom}
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
    .cursor-hand {
        cursor: grab;
    }
</style>
