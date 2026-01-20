import { Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center space-y-4 animate-pulse">
        <div className="flex justify-center">
          <Activity className="w-16 h-16 text-sky-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter">
          EchoSight <span className="text-sky-500">v2.0</span>
        </h1>
        <p className="text-slate-400">
          Turn Social Noise into Strategic Signal.
        </p>
        <div className="pt-4">
          <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-sm font-medium border border-sky-500/20">
            System Operational
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
