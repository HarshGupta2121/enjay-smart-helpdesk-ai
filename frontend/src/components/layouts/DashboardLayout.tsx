import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import Breadcrumb from '../ui/Breadcrumb';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl animate-in fade-in duration-500">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}