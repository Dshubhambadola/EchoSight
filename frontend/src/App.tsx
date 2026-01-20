import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';

// Placeholder Pages
const Dashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium">Metric {i}</h3>
          <p className="text-2xl font-bold text-white mt-2">12,345</p>
        </div>
      ))}
    </div>
  </div>
);

const RealTimeFeed = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold text-white">Live Feed</h1>
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center text-slate-500">
      Feed Component Coming Soon...
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="feed" element={<RealTimeFeed />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
