
import React, { useState, useMemo } from 'react';
import { Note, AppView } from './types';
import { useNotes } from './hooks/useNotes';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import NoteView from './components/NoteView';
import CalendarView from './components/CalendarView';

export default function App() {
    const { notes, addNote, updateNote, deleteNote, toggleTodo, archiveNote, unarchiveNote } = useNotes();
    const [currentView, setCurrentView] = useState<AppView>(AppView.Notes);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [startDateFilter, setStartDateFilter] = useState<string | null>(null);
    const [endDateFilter, setEndDateFilter] = useState<string | null>(null);

    const handleNewNote = () => {
        setIsCreating(true);
        setActiveNote(null);
        setIsEditing(true);
    };

    const handleSelectNote = (note: Note) => {
        setActiveNote(note);
        setIsCreating(false);
        setIsEditing(false);
    };

    const handleEditNote = () => {
        setIsEditing(true);
    };

    const handleClose = () => {
        setActiveNote(null);
        setIsCreating(false);
        setIsEditing(false);
    };

    const handleSaveNote = (noteToSave: Note) => {
        if (isCreating) {
            addNote(noteToSave);
        } else {
            updateNote(noteToSave);
        }
        handleClose();
    };
    
    const handleDeleteNote = (noteId: string) => {
        deleteNote(noteId);
        handleClose();
    }

    const handleImportNotes = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedNotes: Note[] = JSON.parse(e.target?.result as string);
                        // Simple merge for now, could add more sophisticated conflict resolution
                        setNotes(prevNotes => {
                            const existingNoteIds = new Set(prevNotes.map(n => n.id));
                            const newNotes = importedNotes.filter(n => !existingNoteIds.has(n.id));
                            return [...prevNotes, ...newNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        });
                        alert('Notlar başarıyla içe aktarıldı!');
                    } catch (error) {
                        console.error('Failed to parse imported notes:', error);
                        alert('İçe aktarma başarısız oldu. Geçersiz JSON dosyası.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleExportNotes = () => {
        const json = JSON.stringify(notes, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brutalist-agenda-notes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredNotes = useMemo(() => {
        let filtered = notes.filter(note => !note.isArchived);

        if (searchTerm) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (startDateFilter) {
            const start = new Date(startDateFilter);
            filtered = filtered.filter(note => new Date(note.createdAt) >= start);
        }

        if (endDateFilter) {
            const end = new Date(endDateFilter);
            end.setHours(23, 59, 59, 999); // Include the entire end day
            filtered = filtered.filter(note => new Date(note.createdAt) <= end);
        }

        return filtered;
    }, [notes, searchTerm, startDateFilter, endDateFilter]);

    const renderActiveComponent = () => {
        if (isCreating || (activeNote && isEditing)) {
            return (
                <NoteEditor
                    key={activeNote?.id || 'new'}
                    note={activeNote}
                    onSave={handleSaveNote}
                    onClose={handleClose}
                    onDelete={handleDeleteNote}
                    onToggleTodo={toggleTodo}
                />
            );
        } 
        if (activeNote && !isEditing) {
            return <NoteView note={activeNote} onClose={handleClose} onEdit={handleEditNote} onToggleTodo={toggleTodo} onArchive={archiveNote} onUnarchive={unarchiveNote} />;
        }
        return null;
    };
        const renderView = () => {
        switch (currentView) {
            case AppView.Calendar:
                return <CalendarView notes={notes} onSelectNote={handleSelectNote} />;
            case AppView.Tags:
                return <TagManager notes={notes} onClose={handleClose} onUpdateNote={updateNote} />;
            case AppView.Notes:
            default:
                return <NoteList notes={filteredNotes} onSelectNote={handleSelectNote} onSearch={setSearchTerm} searchTerm={searchTerm} onToggleTodo={toggleTodo} onFilterByDate={(start, end) => { setStartDateFilter(start); setEndDateFilter(end); }} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#111111]">
            <Sidebar 
                currentView={currentView}
                onSetView={setCurrentView}
                onNewNote={handleNewNote}
                onImportNotes={handleImportNotes}
                onExportNotes={handleExportNotes}
            />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {renderView()}
            </main>
            {renderActiveComponent()}
        </div>
    );
}
