
import React, { useState, useMemo } from 'react';
import { Note, AppView } from './types';
import { useNotes } from './hooks/useNotes';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import NoteView from './components/NoteView';
import CalendarView from './components/CalendarView';

export default function App() {
    const { notes, addNote, updateNote, deleteNote, toggleTodo } = useNotes();
    const [currentView, setCurrentView] = useState<AppView>(AppView.Notes);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

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

    const filteredNotes = useMemo(() => {
        if (!searchTerm) return notes;
        return notes.filter(note =>
            !note.isArchived && (
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [notes, searchTerm]);

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
