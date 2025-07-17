
import React from 'react';
import { Note, Todo } from '../types';

interface NoteCardProps {
    note: Note;
    onSelect: () => void;
    onToggleTodo: (noteId: string, todoId: string) => void;
}

export default function NoteCard({ note, onSelect, onToggleTodo }: NoteCardProps) {
    const todoSummary = `${note.todos.filter(t => t.completed).length}/${note.todos.length} tamamlandı`;

    const handleTodoClick = (e: React.MouseEvent, todoId: string) => {
        e.stopPropagation(); // Prevent card selection when toggling todo
        onToggleTodo(note.id, todoId);
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-black border-2 border-gray-600 p-4 flex flex-col justify-between h-48 cursor-pointer group hover:border-red-500 transition-colors duration-100"
        >
            <div>
                <h3 className="font-bold text-xl text-red-500 uppercase truncate mb-2">{note.title}</h3>
                <div className="text-gray-400 text-sm break-words line-clamp-3">
                    {note.content ? <p className="text-gray-300">{note.content}</p> : (
                        <ul className="list-none p-0 m-0">
                            {note.todos.slice(0, 3).map(todo => (
                                <li key={todo.id} className={`flex items-center ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                    <span className="mr-2 cursor-pointer" onClick={(e) => handleTodoClick(e, todo.id)}>
                                        {todo.completed ? '☑' : '☐'}
                                    </span>
                                    <span>{todo.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div>
                {note.todos.length > 0 && (
                    <p className="text-xs text-red-500 font-bold mt-2 uppercase">{todoSummary}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 border border-gray-500 uppercase">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
