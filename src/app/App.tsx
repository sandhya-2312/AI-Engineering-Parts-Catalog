import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import ARViewer from './components/ARViewer';
import Export from './components/Export';
import Settings from './components/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/export" element={<Export />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/ar-viewer" element={<ARViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
