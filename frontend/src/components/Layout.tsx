import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-blue-500">Siyada</span>
              <span className="text-purple-500"> AI</span>
            </h1>
            <p className="text-xs text-[#94a3b8]">Lead Generation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500/10 text-blue-500 border-l-2 border-blue-500'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e1e2e]/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#1e1e2e]">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-[#e2e8f0] truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-[#94a3b8] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[#94a3b8] hover:text-red-400 rounded-lg hover:bg-[#1e1e2e]/50 shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#12121a] border-r border-[#1e1e2e] flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#12121a] border-r border-[#1e1e2e] transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#12121a] border-b border-[#1e1e2e]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#94a3b8] hover:text-[#e2e8f0] rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-bold">
            <span className="text-blue-500">Siyada</span>
            <span className="text-purple-500"> AI</span>
          </h1>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
