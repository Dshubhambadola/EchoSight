import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { SearchProvider } from '../context/SearchContext';

export function DashboardLayout() {
    return (
        <SearchProvider>
            <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                    <Header />
                    <main className="flex-1 overflow-auto pt-16 p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SearchProvider>
    );
}
