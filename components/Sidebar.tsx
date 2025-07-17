
import React from 'react';
import { AppView } from '../types';
import { NoteIcon, CalendarIcon, PlusIcon, TagIcon, ImportIcon, ExportIcon } from '../constants';
import UtilityButtons from './UtilityButtons';

interface SidebarProps {
    currentView: AppView;
    onSetView: (view: AppView) => void;
    onNewNote: () => void;
    onImportNotes: () => void;
    onExportNotes: () => void;
}

const SidebarButton = ({ children, onClick, isActive }: { children: React.ReactNode, onClick: () => void, isActive: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center p-4 border-y-2 border-transparent transition-colors duration-100 ${isActive ? 'bg-red-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
    >
        {children}
    </button>
);

export default function Sidebar({ currentView, onSetView, onNewNote, onImportNotes, onExportNotes }: SidebarProps) {
    return (
        <aside className="w-20 bg-black flex flex-col items-center border-r-2 border-gray-800">
            <div className="w-full text-center p-4 text-red-500 font-extrabold text-5xl border-b-2 border-gray-800">
                B.
            </div>
            <nav className="flex flex-col items-center w-full mt-8">
                 <SidebarButton onClick={onNewNote} isActive={false}>
                     <div className="flex flex-col items-center">
                        <PlusIcon className="w-8 h-8 text-red-500" />
                        <span className="text-xs mt-1 font-bold text-red-500">YENİ</span>
                     </div>
                </SidebarButton>
                
                <div className="w-full h-px bg-gray-800 my-4"></div>

                <SidebarButton onClick={() => onSetView(AppView.Notes)} isActive={currentView === AppView.Notes}>
                    <div className="flex flex-col items-center">
                        <NoteIcon className="w-7 h-7" />
                        <span className="text-xs mt-1 font-bold">NOTLAR</span>
                    </div>
                </SidebarButton>
                <SidebarButton onClick={() => onSetView(AppView.Calendar)} isActive={currentView === AppView.Calendar}>
                    <div className="flex flex-col items-center">
                        <CalendarIcon className="w-7 h-7" />
                        <span className="text-xs mt-1 font-bold">TAKVİM</span>
                    </div>
                </SidebarButton>
                <SidebarButton onClick={() => onSetView(AppView.Tags)} isActive={currentView === AppView.Tags}>
                    <div className="flex flex-col items-center">
                        <TagIcon className="w-7 h-7" />
                        <span className="text-xs mt-1 font-bold">ETİKETLER</span>
                    </div>
                </SidebarButton>
            </nav>
            <UtilityButtons onImport={onImportNotes} onExport={onExportNotes} />
        </aside>
    );
}
