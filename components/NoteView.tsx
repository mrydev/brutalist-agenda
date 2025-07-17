import React from 'react';
import { Note } from '../types';
import { CloseIcon, EditIcon } from '../constants';

interface NoteViewProps {
    note: Note;
    onClose: () => void;
    onEdit: () => void;
}

export default function NoteView({ note, onClose, onEdit }: NoteViewProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border-2 border-gray-800 w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b-2 border-gray-800">
                    <h2 className="text-xl font-bold uppercase truncate">{note.title}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={onEdit} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <EditIcon className="w-6 h-6" />
                        </button>
                        <button onClick={handleDownloadPdf} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-wrap break-words">
                            {note.content}
                        </p>
                    </div>

                    {note.todos.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-2 uppercase">Yapılacaklar</h4>
                            <div className="space-y-2">
                                {note.todos.map(todo => (
                                    <div key={todo.id} className={`flex items-center gap-3 ${todo.completed ? 'text-gray-500' : 'text-white'}`}>
                                        <span className="mr-2">{todo.completed ? '☑' : '☐'}</span>
                                        <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {note.tags.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-2 uppercase">Etiketler</h4>
                            <div className="flex flex-wrap gap-2">
                                {note.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                 <footer className="p-4 border-t-2 border-gray-800 text-xs text-gray-500">
                    Oluşturulma: {new Date(note.createdAt).toLocaleString()}
                </footer>
            </div>
        </div>
    );
}
