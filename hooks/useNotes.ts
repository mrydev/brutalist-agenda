
import { useState, useEffect, useCallback } from 'react';
import { Note, Todo } from '../types';

// This is where you would integrate Firebase/Firestore.
// The current implementation uses localStorage for offline-first persistence.

const STORAGE_KEY = 'brutalist-agenda-notes';

const getInitialNotes = (): Note[] => {
    try {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item) {
            const parsedNotes = JSON.parse(item) as Note[];
            // Sort by most recent first
            return parsedNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    }

    // Return mock data if localStorage is empty
    return [
        {
            id: '1',
            title: 'Proje Fikri',
            content: 'Brutalist tasarım ilkelerine sahip bir not alma uygulaması. Ham beton, keskin hatlar ve işlevsellik ön planda.',
            tags: ['geliştirme', 'tasarım'],
            todos: [
                { id: 't1-1', text: 'Renk paletini belirle', completed: true },
                { id: 't1-2', text: 'Tipografi seçimi yap', completed: false },
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
        {
            id: '2',
            title: 'Alışveriş Listesi',
            content: 'Haftalık market alışverişi.',
            tags: ['kişisel'],
            todos: [
                { id: 't2-1', text: 'Süt', completed: true },
                { id: 't2-2', text: 'Ekmek', completed: true },
                { id: 't2-3', text: 'Yumurta', completed: false },
            ],
            createdAt: new Date().toISOString(),
        },
    ];
};


export const useNotes = () => {
    const [notes, setNotes] = useState<Note[]>(getInitialNotes);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [notes]);

    const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt'>) => {
        const newNote: Note = {
            ...noteData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            todos: noteData.todos.map(todo => ({...todo, id: `t-${Date.now()}-${Math.random()}`}))
        };
        setNotes(prevNotes => [newNote, ...prevNotes]);
    }, []);

    const updateNote = useCallback((updatedNote: Note) => {
        setNotes(prevNotes =>
            prevNotes.map(note => (note.id === updatedNote.id ? updatedNote : note))
        );
    }, []);

    const deleteNote = useCallback((noteId: string) => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    }, []);
    
    const toggleTodo = useCallback((noteId: string, todoId: string) => {
        setNotes(prevNotes => prevNotes.map(note => {
            if (note.id === noteId) {
                return {
                    ...note,
                    todos: note.todos.map(todo => 
                        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
                    )
                };
            }
            return note;
        }));
    }, []);

    return { notes, addNote, updateNote, deleteNote, toggleTodo };
};
