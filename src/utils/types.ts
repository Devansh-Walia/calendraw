export interface Day {
    name: string;
    enabled: boolean;
    date: Date;
    id: string;
    state?: string;
}

export interface CanvasData {
    [key: string]: string;
}
