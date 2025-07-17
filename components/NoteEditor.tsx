
import React, { useState, useEffect, useCallback } from 'react';
import { Note, Todo } from '../types';
import { CloseIcon, TrashIcon, BellIcon, ArchiveIcon, UnarchiveIcon } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteEditorProps {
    note: Note | null;
    onSave: (note: Note) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
    onToggleTodo: (noteId: string, todoId: string) => void;
}

const BrutalistButton = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 border-2 bg-black text-white hover:bg-white hover:text-black transition-colors duration-150 ${className}`}
    >
        {children}
    </button>
);

export default function NoteEditor({ note, onSave, onClose, onDelete, onToggleTodo }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [todoInput, setTodoInput] = useState('');
    const [reminder, setReminder] = useState<{ date: string; repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly' } | undefined>(undefined);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags);
            setTodos(note.todos);
            setReminder(note.reminder ? { date: note.reminder.date, repeat: note.reminder.repeat } : undefined);
        }
    }, [note]);

    const handleSave = () => {
        const noteToSave: Note = {
            id: note?.id || Date.now().toString(),
            title: title || 'Başlıksız Not',
            content,
            tags,
            todos,
            createdAt: note?.createdAt || new Date().toISOString(),
            reminder: reminder ? { date: reminder.date, repeat: reminder.repeat } : undefined,
        };
        onSave(noteToSave);
    };
    
    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };
    
    const handleAddTodo = () => {
        if (todoInput.trim()) {
            const newTodo: Todo = {
                id: `temp-${Date.now()}`,
                text: todoInput.trim(),
                completed: false,
            };
            setTodos([...todos, newTodo]);
            setTodoInput('');
        }
    };

    const handleReminder = async () => {
        if (!('Notification' in window)) {
            alert('Bu tarayıcı bildirimleri desteklemiyor.');
            return;
        }

        if (Notification.permission === 'granted') {
            setNotification();
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotification();
            }
        }
    };

    const setNotification = () => {
        if (!note || !reminder?.date) return;
        const reminderTime = new Date(reminder.date).getTime();
        const now = new Date().getTime();
        const delay = reminderTime - now;

        if (delay > 0) {
            setTimeout(() => {
                new Notification(note.title, {
                    body: note.content.substring(0, 100),
                    icon: '/favicon.svg'
                });
            }, delay);
            alert(`Hatırlatıcı ${new Date(reminder.date).toLocaleString()} için ayarlandı.`);
        } else {
            alert('Lütfen gelecek bir zaman seçin.');
        }
    };

    const exportToTxt = () => {        const todoListString = todos.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');        const textContent = `Başlık: ${title}\n\nİçerik:\n${content}\n\nEtiketler: ${tags.join(', ')}\n\nYapılacaklar:\n${todoListString}`;        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });        const link = document.createElement('a');        link.href = URL.createObjectURL(blob);        link.download = `${title.replace(/\s+/g, '_')}.txt`;        link.click();        URL.revokeObjectURL(link.href);    };

    const exportToPdf = () => {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.text(title, 10, 10);
        doc.setFont('helvetica', 'normal');
        doc.text(content, 10, 20, { maxWidth: 180 });
        const finalY = (doc as any).lastAutoTable.finalY || 30;
        doc.text(`Etiketler: ${tags.join(', ')}`, 10, finalY + 10);
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    };

    const handleToggleTodoInternal = (todoId: string) => {
        if (note?.id) {
            onToggleTodo(note.id, todoId);
        } 
        setTodos(currentTodos => currentTodos.map(t => t.id === todoId ? {...t, completed: !t.completed} : t));
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border-2 border-red-500 w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b-2 border-gray-600">
                    <h2 className="text-xl font-bold uppercase text-red-500">{note ? 'Notu Düzenle' : 'Yeni Not'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-150">
                        <CloseIcon className="w-8 h-8"/>
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Başlık..."
                        className="w-full bg-transparent text-white text-3xl font-bold p-3 border-2 border-gray-600 focus:outline-none focus:border-red-500 uppercase"
                    />
                    <div className="flex items-center gap-2 mb-4">
                        <BrutalistButton onClick={() => setShowPreview(false)} className={!showPreview ? 'bg-red-500 text-black' : ''}>Yaz</BrutalistButton>
                        <BrutalistButton onClick={() => setShowPreview(true)} className={showPreview ? 'bg-red-500 text-black' : ''}>Önizle</BrutalistButton>
                    </div>
                    {showPreview ? (
                        <div className="prose prose-invert max-w-none border-2 border-gray-600 p-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Aklındakileri yaz..."
                            className="w-full h-48 bg-transparent text-gray-300 p-3 border-2 border-gray-600 focus:outline-none focus:border-red-500 resize-none"
                        />
                    )}

                    {/* Tags */}
                    <div className="border-2 border-gray-600 p-3">
                        <h4 className="font-bold mb-2 uppercase text-gray-400">Etiketler</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <div key={tag} className="bg-gray-700 text-white px-3 py-1 flex items-center gap-2 border border-gray-500">
                                    <span>{tag}</span>
                                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-red-500 font-bold text-lg leading-none">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagInput}
                            placeholder="Etiket ekle (boşlukla ayır)"
                            className="w-full bg-transparent text-white p-2 border-b-2 border-gray-600 focus:outline-none focus:border-red-500"
                        />
                    </div>
                    
                    {/* Todos */}
                    <div className="border-2 border-gray-600 p-3">
                        <h4 className="font-bold mb-2 uppercase text-gray-400">Yapılacaklar</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {todos.map(t => (
                                <div key={t.id} className="flex items-center gap-3">
                                    <input type="checkbox" checked={t.completed} onChange={() => handleToggleTodoInternal(t.id)} className="w-5 h-5 bg-transparent border-2 border-red-500 text-red-500 focus:ring-red-500 accent-red-500" />
                                    <span className={`flex-1 ${t.completed ? 'line-through text-gray-500' : 'text-white'}`}>{t.text}</span>
                                </div>
                            ))}
                        </div>
                         <div className="flex gap-2 mt-2">
                             <input
                                type="text"
                                value={todoInput}
                                onChange={e => setTodoInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                                placeholder="Yeni görev ekle..."
                                className="flex-1 bg-transparent p-2 border-b-2 border-gray-600 focus:outline-none focus:border-red-500"
                            />
                            <BrutalistButton onClick={handleAddTodo} className="border-gray-600">Ekle</BrutalistButton>
                        </div>
                    </div>
                     {/* Reminder */}
                    <div className="border-2 border-gray-600 p-3">
                        <h4 className="font-bold mb-2 uppercase text-gray-400">Hatırlatıcı</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="datetime-local"
                                value={reminder?.date ? reminder.date.substring(0, 16) : ''}
                                onChange={e => setReminder(prev => ({ ...prev, date: e.target.value }))}
                                className="bg-transparent text-white p-2 border-2 border-gray-600 focus:outline-none focus:border-red-500"
                            />
                            <select
                                value={reminder?.repeat || ''}
                                onChange={e => setReminder(prev => ({ ...prev, repeat: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined }))}
                                className="bg-transparent text-white p-2 border-2 border-gray-600 focus:outline-none focus:border-red-500"
                            >
                                <option value="">Tek Seferlik</option>
                                <option value="daily">Günlük</option>
                                <option value="weekly">Haftalık</option>
                                <option value="monthly">Aylık</option>
                                <option value="yearly">Yıllık</option>
                            </select>
                            <BrutalistButton onClick={handleReminder} className="border-gray-600">
                                <BellIcon className="w-6 h-6"/>
                            </BrutalistButton>
                        </div>
                    </div>

                </main>

                <footer className="flex items-center justify-between p-4 border-t-2 border-gray-600">
                    <div className="flex gap-2">
                        {note && (
                            <BrutalistButton onClick={() => onDelete(note.id)} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black">
                                <TrashIcon className="w-5 h-5"/>
                            </BrutalistButton>
                        )}
                        {note && note.isArchived ? (
                            <BrutalistButton onClick={() => onUnarchive(note.id)} className="border-gray-600">
                                <UnarchiveIcon className="w-5 h-5"/>
                            </BrutalistButton>
                        ) : note && (
                            <BrutalistButton onClick={() => onArchive(note.id)} className="border-gray-600">
                                <ArchiveIcon className="w-5 h-5"/>
                            </BrutalistButton>
                        )}
                        <BrutalistButton onClick={exportToTxt} className="border-gray-600">TXT</BrutalistButton>
                        <BrutalistButton onClick={exportToPdf} className="border-gray-600">PDF</BrutalistButton>
                    </div>
                    <BrutalistButton onClick={handleSave} className="border-red-500 bg-red-500 text-black hover:bg-black hover:text-red-500">
                        Kaydet
                    </BrutalistButton>
                </footer>
            </div>
        </div>
    );
}
