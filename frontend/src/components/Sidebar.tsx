import { BarChart2, Home, Settings, FileText, Activity, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import clsx from 'clsx';

const NAV_ITEMS = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Activity, label: 'Live Feed', path: '/feed' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    const location = useLocation();
    const auth = useAuth();
    const user = auth.user?.profile;

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <Activity className="w-6 h-6 text-sky-500 mr-2" />
                <span className="text-xl font-bold tracking-tight text-white">
                    EchoSight
                </span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            location.pathname === item.path
                                ? 'bg-sky-500/10 text-sky-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user?.preferred_username?.substring(0, 2).toUpperCase() || 'JD'}
                        </div>
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium text-white truncate max-w-[90px]">
                                {user?.preferred_username || 'John Doe'}
                            </p>
                            <p className="text-xs text-slate-500">Admin Workspace</p>
                        </div>
                    </div>
                    <button
                        onClick={() => auth.signoutRedirect()}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
