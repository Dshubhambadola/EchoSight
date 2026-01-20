import { Bell, Search } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

export function Header() {
    const { query, setQuery } = useSearch();

    return (
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 fixed w-[calc(100%-16rem)] ml-64 z-10">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-sky-500 sm:text-sm transition-colors"
                        placeholder="Search mentions, hashtags, or users..."
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>
            </div>
        </header>
    );
}
