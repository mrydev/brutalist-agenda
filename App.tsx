
import React, { useState, useMemo } from 'react';
import { useNotes } from './hooks/useNotes';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteView from './components/NoteView';
import NoteEditor from './components/NoteEditor';
import CalendarView from './components/CalendarView';
import TagManager from './components/TagManager';
import { AppView, Note } from './types';
import './index.css';

export default function App() {
    const {
        notes,
        addNote,
        updateNote,
        deleteNote,
        toggleTodo,
        archiveNote,
        unarchiveNote
    } = useNotes();

    const [currentView, setCurrentView] = useState<AppView>(AppView.Notes);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const handleNewNote = () => {
        setIsEditing(true);
        setSelectedNote(null);
        setCurrentView(AppView.Editor);
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setIsEditing(false);
        setCurrentView(AppView.Viewer);
    };

    const handleEditNote = () => {
        setIsEditing(true);
        setCurrentView(AppView.Editor);
    };

    const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
        if (selectedNote) {
            updateNote({ ...selectedNote, ...noteData });
        } else {
            addNote(noteData);
        }
        setIsEditing(false);
        setSelectedNote(null);
        setCurrentView(AppView.Notes);
    };

    const handleClose = () => {
        setSelectedNote(null);
        setIsEditing(false);
        setCurrentView(AppView.Notes);
    };

    const handleSetView = (view: AppView) => {
        if (view === AppView.Notes) {
            setSelectedTag(null); // Reset tag filter when switching to general notes view
        }
        setCurrentView(view);
        setSelectedNote(null);
        setIsEditing(false);
    };
    
    const handleTagSelect = (tag: string | null) => {
        setSelectedTag(tag);
        setCurrentView(AppView.Notes); // Switch to notes view to show filtered notes
    };

    const handleImportNotes = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedNotes = JSON.parse(event.target?.result as string) as Note[];
                        // Basic validation
                        if (Array.isArray(importedNotes)) {
                            importedNotes.forEach(note => addNote(note));
                        }
                    } catch (error) {
                        console.error("Failed to parse imported file:", error);
                        alert("Error: Invalid JSON file.");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleExportNotes = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "brutalist-agenda-export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const filteredNotes = useMemo(() => {
        let activeNotes = notes.filter(note => !note.isArchived);

        if (selectedTag) {
            activeNotes = activeNotes.filter(note => note.tags.includes(selectedTag));
        }
        
        if (searchTerm) {
            activeNotes = activeNotes.filter(note =>
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return activeNotes;
    }, [notes, searchTerm, selectedTag]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(note => {
            note.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [notes]);

    const renderMainContent = () => {
        if (isEditing || currentView === AppView.Editor) {
            return <NoteEditor note={selectedNote} onSave={handleSaveNote} onClose={handleClose} />;
        }
        if (selectedNote && currentView === AppView.Viewer) {
            return <NoteView 
                        note={selectedNote} 
                        onClose={handleClose} 
                        onEdit={handleEditNote} 
                        onToggleTodo={toggleTodo}
                        onArchive={archiveNote}
                        onUnarchive={unarchiveNote}
                    />;
        }
        switch (currentView) {
            case AppView.Calendar:
                return <CalendarView notes={notes} onSelectNote={handleSelectNote} />;
            case AppView.Tags:
                return <TagManager tags={allTags} onTagSelect={handleTagSelect} selectedTag={selectedTag} />;
            case AppView.Notes:
            default:
                return (
                    <NoteList
                        notes={filteredNotes}
                        onSelectNote={handleSelectNote}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedTag={selectedTag}
                        onClearTagFilter={() => setSelectedTag(null)}
                    />
                );
        }
    };

    return (
        <div className="flex h-screen bg-black text-white">
            <Sidebar 
                currentView={currentView} 
                onSetView={handleSetView} 
                onNewNote={handleNewNote}
                onImportNotes={handleImportNotes}
                onExportNotes={handleExportNotes}
            />
            <main className="flex-1 flex flex-col">
                {renderMainContent()}
            </main>
        </div>
    );
}
