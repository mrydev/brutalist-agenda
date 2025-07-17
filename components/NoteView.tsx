import React from 'react';
import { Note } from '../types';
import { CloseIcon, EditIcon, DownloadIcon, ArchiveIcon, UnarchiveIcon } from '../constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteViewProps {
    note: Note;
    onClose: () => void;
    onEdit: () => void;
    onToggleTodo: (noteId: string, todoId: string) => void;
    onArchive: (noteId: string) => void;
    onUnarchive: (noteId: string) => void;
}

export default function NoteView({ note, onClose, onEdit, onToggleTodo, onArchive, onUnarchive }: NoteViewProps) {
    const handleDownloadPdf = () => {
        const input = document.getElementById('note-content-to-pdf');
        if (input) {
            html2canvas(input, {
                scale: 2, // Increase scale for better quality
                useCORS: true, // Enable CORS if images are involved
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                pdf.save(`${note.title}.pdf`);
            });
        }
    };

    const handleToggleTodoClick = (todoId: string) => {
        onToggleTodo(note.id, todoId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border-2 border-gray-800 w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b-2 border-gray-600">
                    <h2 className="text-xl font-bold uppercase truncate text-red-500">{note.title}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={onEdit} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <EditIcon className="w-6 h-6" />
                        </button>
                        <button onClick={handleDownloadPdf} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                        {note.isArchived ? (
                            <button onClick={() => onUnarchive(note.id)} className="text-gray-500 hover:text-white transition-colors duration-150">
                                <UnarchiveIcon className="w-6 h-6" />
                            </button>
                        ) : (
                            <button onClick={() => onArchive(note.id)} className="text-gray-500 hover:text-white transition-colors duration-150">
                                <ArchiveIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-150">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                    </div>
                </header>

                <main id="note-content-to-pdf" className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="prose prose-invert max-w-none border-2 border-gray-600 p-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                    </div>

                    {note.todos.length > 0 && (
                        <div className="border-2 border-gray-600 p-3">
                            <h4 className="font-bold mb-2 uppercase text-gray-400">Yapılacaklar</h4>
                            <div className="space-y-2">
                                {note.todos.map(todo => (
                                    <div key={todo.id} className={`flex items-center gap-3 ${todo.completed ? 'text-gray-500' : 'text-white'}`}>
                                        <span className="mr-2 cursor-pointer" onClick={() => handleToggleTodoClick(todo.id)}>{todo.completed ? '☑' : '☐'}</span>
                                        <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {note.tags.length > 0 && (
                        <div className="border-2 border-gray-600 p-3">
                            <h4 className="font-bold mb-2 uppercase text-gray-400">Etiketler</h4>
                            <div className="flex flex-wrap gap-2">
                                {note.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 border border-gray-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                 <footer className="p-4 border-t-2 border-gray-600 text-xs text-gray-400">
                    Oluşturulma: {new Date(note.createdAt).toLocaleString()}
                </footer>
            </div>
        </div>
    );
}
