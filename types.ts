
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
    reminder?: {
        date: string; // ISO string format
        repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }; // Optional reminder object
    isArchived: boolean;
}

export enum AppView {
    Notes = 'NOTES',
    Calendar = 'CALENDAR',
    Tags = 'TAGS',
}
