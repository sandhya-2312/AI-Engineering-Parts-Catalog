import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import ARViewer from './components/ARViewer';
import Settings from './components/Settings';
import Members from './components/Members';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePasswordDialog from './components/ChangePasswordDialog';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ChangePasswordDialog />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/members" element={<Members />} />
            </Route>
            <Route path="/ar-viewer" element={<ARViewer />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
