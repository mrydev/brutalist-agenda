
interface NoteListProps {
    notes: Note[];
    onSelectNote: (note: Note) => void;
    onSearch: (term: string) => void;
    searchTerm: string;
    onToggleTodo: (noteId: string, todoId: string) => void;
    onFilterByDate: (startDate: string | null, endDate: string | null) => void;
}

export default function NoteList({ notes, onSelectNote, onSearch, searchTerm, onToggleTodo, onFilterByDate }: NoteListProps) {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        onFilterByDate(startDate || null, endDate || null);
    }, [startDate, endDate, onFilterByDate]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold uppercase text-red-500 mb-4">Not Defteri</h1>
                <input
                    type="text"
                    placeholder="ARA VEYA FİLTRELE..."
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-transparent text-white p-3 border-2 border-gray-600 focus:outline-none focus:border-red-500 transition-colors duration-200 text-lg uppercase mb-4"
                />
                <div className="flex gap-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 bg-transparent text-white p-3 border-2 border-gray-600 focus:outline-none focus:border-red-500"
                        title="Başlangıç Tarihi"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 bg-transparent text-white p-3 border-2 border-gray-600 focus:outline-none focus:border-red-500"
                        title="Bitiş Tarihi"
                    />
                </div>
            </div>
            {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} onSelect={() => onSelectNote(note)} onToggleTodo={onToggleTodo} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 border-2 border-gray-600 p-8">
                    <p className="text-2xl font-bold uppercase mb-4">Not bulunamadı.</p>
                    <p className="text-lg">Yeni bir not oluşturarak başlayın.</p>
                </div>
            )}
        </div>
    );
}
