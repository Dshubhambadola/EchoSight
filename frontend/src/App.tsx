import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RealTimeFeed } from './components/Feed/RealTimeFeed';
import { Analytics } from './pages/Analytics';
import { Upgrade } from './pages/Upgrade';

import { Dashboard } from './pages/Dashboard';



import { ProtectedRoute } from './components/Auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="feed" element={<RealTimeFeed />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
