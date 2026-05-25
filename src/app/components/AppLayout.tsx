import { Outlet } from 'react-router';
import { SidebarProvider } from './SidebarContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppearanceSettings } from '../hooks/useAppearanceSettings';

export default function AppLayout() {
  useAppearanceSettings();

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
          <Header />
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
