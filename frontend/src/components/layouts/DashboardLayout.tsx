import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import Breadcrumb from '../ui/Breadcrumb';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="container mx-auto p-6 max-w-7xl">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}