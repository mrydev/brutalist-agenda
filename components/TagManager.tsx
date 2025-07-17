import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { CloseIcon } from '../constants';

interface TagManagerProps {
    notes: Note[];
    onClose: () => void;
    onUpdateNote: (note: Note) => void;
}

const BrutalistButton = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 border-2 bg-black text-white hover:bg-white hover:text-black transition-colors duration-150 ${className}`}
    >
        {children}
    </button>
);

export default function TagManager({ notes, onClose, onUpdateNote }: TagManagerProps) {
    const [allTags, setAllTags] = useState<string[]>([]);
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState<string>('');

    useEffect(() => {
        const tags = new Set<string>();
        notes.forEach(note => {
            note.tags.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
    }, [notes]);

    const handleEditTag = (tag: string) => {
        setEditingTag(tag);
        setNewTagName(tag);
    };

    const handleSaveTag = (oldTag: string) => {
        if (newTagName.trim() === '' || newTagName === oldTag) {
            setEditingTag(null);
            setNewTagName('');
            return;
        }

        const updatedNotes = notes.map(note => ({
            ...note,
            tags: note.tags.map(tag => (tag === oldTag ? newTagName.trim() : tag))
        }));
        updatedNotes.forEach(note => onUpdateNote(note));

        setEditingTag(null);
        setNewTagName('');
    };

    const handleDeleteTag = (tagToDelete: string) => {
        if (window.confirm(`Are you sure you want to delete the tag "${tagToDelete}"? This will remove it from all notes.`)) {
            const updatedNotes = notes.map(note => ({
                ...note,
                tags: note.tags.filter(tag => tag !== tagToDelete)
            }));
            updatedNotes.forEach(note => onUpdateNote(note));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border-2 border-red-500 w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b-2 border-gray-600">
                    <h2 className="text-xl font-bold uppercase text-red-500">Etiketleri Yönet</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-150">
                        <CloseIcon className="w-8 h-8"/>
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-4">
                    {allTags.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <p>Henüz etiket yok.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allTags.map(tag => (
                                <div key={tag} className="flex items-center justify-between border-2 border-gray-600 p-3">
                                    {editingTag === tag ? (
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={e => setNewTagName(e.target.value)}
                                            onBlur={() => handleSaveTag(tag)}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveTag(tag)}
                                            className="bg-transparent text-white flex-1 mr-2 p-1 border-b-2 border-red-500 focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-white text-lg uppercase">#{tag}</span>
                                    )}
                                    <div className="flex gap-2">
                                        {editingTag !== tag && (
                                            <BrutalistButton onClick={() => handleEditTag(tag)} className="border-gray-600">Düzenle</BrutalistButton>
                                        )}
                                        <BrutalistButton onClick={() => handleDeleteTag(tag)} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black">Sil</BrutalistButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t-2 border-gray-600 text-xs text-gray-400">
                    <p>Etiketler notlarınızdan otomatik olarak toplanır.</p>
                </footer>
            </div>
        </div>
    );
}