
export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    todos: Todo[];
    createdAt: string; // ISO string format
    reminder?: string; // Optional reminder date
}

export enum AppView {
    Notes = 'NOTES',
    Calendar = 'CALENDAR',
}
