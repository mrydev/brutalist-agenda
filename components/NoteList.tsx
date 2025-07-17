
import React from 'react';
import { Note } from '../types';
import NoteCard from './NoteCard';

interface NoteListProps {
    notes: Note[];
    onSelectNote: (note: Note) => void;
    onSearch: (term: string) => void;
    searchTerm: string;
    onToggleTodo: (noteId: string, todoId: string) => void;
}

export default function NoteList({ notes, onSelectNote, onSearch, searchTerm, onToggleTodo }: NoteListProps) {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold uppercase text-white mb-2">Not Defteri</h1>
                <input
                    type="text"
                    placeholder="Ara veya Filtrele..."
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-transparent text-white p-2 border-b-2 border-gray-600 focus:outline-none focus:border-red-500 transition-colors duration-200 text-lg"
                />
            </div>
            {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} onSelect={() => onSelectNote(note)} onToggleTodo={onToggleTodo} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">Not bulunamadı.</p>
                    <p>Yeni bir not oluşturarak başlayın.</p>
                </div>
            )}
        </div>
    );
}
