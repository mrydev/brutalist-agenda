
import React, { useState } from 'react';
import { Note } from '../types';

interface CalendarViewProps {
    notes: Note[];
    onSelectNote: (note: Note) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ notes, onSelectNote }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const getRecurringDates = (note: Note, startDate: Date, endDate: Date): Note[] => {
        if (!note.reminder || !note.reminder.date || !note.reminder.repeat) {
            return [];
        }

        const recurringNotes: Note[] = [];
        let reminderDate = new Date(note.reminder.date);

        // Adjust reminderDate to be within the current week or in the past for initial calculation
        while (reminderDate < startDate) {
            if (note.reminder.repeat === 'daily') {
                reminderDate.setDate(reminderDate.getDate() + 1);
            } else if (note.reminder.repeat === 'weekly') {
                reminderDate.setDate(reminderDate.getDate() + 7);
            } else if (note.reminder.repeat === 'monthly') {
                reminderDate.setMonth(reminderDate.getMonth() + 1);
            } else if (note.reminder.repeat === 'yearly') {
                reminderDate.setFullYear(reminderDate.getFullYear() + 1);
            } else {
                break;
            }
        }

        while (reminderDate <= endDate) {
            if (reminderDate >= startDate) {
                recurringNotes.push({
                    ...note,
                    id: `${note.id}-${reminderDate.getTime()}`, // Unique ID for recurring instance
                    createdAt: reminderDate.toISOString(), // Use reminder date for display
                    title: `[${note.reminder.repeat.toUpperCase()}] ${note.title}`,
                });
            }

            if (note.reminder.repeat === 'daily') {
                reminderDate.setDate(reminderDate.getDate() + 1);
            } else if (note.reminder.repeat === 'weekly') {
                reminderDate.setDate(reminderDate.getDate() + 7);
            } else if (note.reminder.repeat === 'monthly') {
                reminderDate.setMonth(reminderDate.getMonth() + 1);
            } else if (note.reminder.repeat === 'yearly') {
                reminderDate.setFullYear(reminderDate.getFullYear() + 1);
            } else {
                break;
            }
        }
        return recurringNotes;
    };

    const weekStart = startOfWeek(currentDate);
    const weekEnd = addDays(weekStart, 6);
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const notesByDate: { [key: string]: Note[] } = {};
    notes.forEach(note => {
        // Add original notes
        const createdAtDate = new Date(note.createdAt);
        if (createdAtDate >= weekStart && createdAtDate <= weekEnd) {
            const dateKey = createdAtDate.toDateString();
            if (!notesByDate[dateKey]) {
                notesByDate[dateKey] = [];
            }
            notesByDate[dateKey].push(note);
        }

        // Add recurring reminders
        const recurring = getRecurringDates(note, weekStart, weekEnd);
        recurring.forEach(recNote => {
            const dateKey = new Date(recNote.createdAt).toDateString();
            if (!notesByDate[dateKey]) {
                notesByDate[dateKey] = [];
            }
            notesByDate[dateKey].push(recNote);
        });
    });
    
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold uppercase text-white">Takvim</h1>
                <div className="flex items-center space-x-2">
                     <button onClick={handlePrevWeek} className="px-4 py-2 border-2 border-gray-600 text-white hover:border-red-500 transition-colors duration-150">
                        &lt; Önceki
                    </button>
                    <span className="text-xl font-bold text-white">
                        {weekStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextWeek} className="px-4 py-2 border-2 border-gray-600 text-white hover:border-red-500 transition-colors duration-150">
                        Sonraki &gt;
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 h-[70vh] border-t-2 border-l-2 border-gray-800">
                {weekDays.map((day, index) => {
                    const dateKey = day.toDateString();
                    const dayNotes = notesByDate[dateKey] || [];
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div key={day.toISOString()} className="border-r-2 border-b-2 border-gray-800 p-2 flex flex-col">
                            <div className={`flex justify-between items-center ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                                <span className="font-bold text-lg">{day.getDate()}</span>
                                <span className="font-bold text-sm uppercase">{dayNames[index]}</span>
                            </div>
                            <div className="mt-2 space-y-1 overflow-y-auto flex-1">
                                {dayNotes.map(note => (
                                    <div 
                                        key={note.id} 
                                        onClick={() => onSelectNote(note)}
                                        className="bg-gray-900 p-1 cursor-pointer hover:bg-red-900 transition-colors duration-100"
                                    >
                                        <p className="text-white text-xs truncate">{note.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
