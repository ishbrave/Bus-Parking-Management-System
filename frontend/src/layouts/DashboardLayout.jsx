import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ParkingSquare, Users, Bus, Receipt, CreditCard, FileText,
  LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/parking-spaces', label: 'Parking Spaces', icon: ParkingSquare },
  { path: '/owners', label: 'Owners', icon: Users },
  { path: '/buses', label: 'Buses', icon: Bus },
  { path: '/parking-records', label: 'Parking Records', icon: Receipt },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/reports', label: 'Reports', icon: FileText },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full z-30 flex-col transition-all duration-300 bg-white/70 backdrop-blur-xl border-r border-blue-100 shadow-lg shadow-blue-100/50 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-100">
          {!collapsed && (
            <h1 className="text-lg font-bold text-blue-600 truncate">TransitPro</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={20} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-blue-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 pb-16 lg:pb-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-500">Welcome,</span>
              <span className="text-sm font-semibold text-blue-600">{user?.name || 'User'}</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        <footer className="hidden lg:block bg-white/70 backdrop-blur-xl border-t border-blue-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex gap-4">
              <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
              <Link to="/parking-spaces" className="hover:text-blue-500">Spaces</Link>
              <Link to="/reports" className="hover:text-blue-500">Reports</Link>
            </div>
            <div className="text-center">
              <span>Ishimwe Brave | ishimwebrave8@gmail.com | 0738091744</span>
            </div>
            <div className="font-medium text-blue-500">Powered by Brave</div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-blue-100 shadow-lg shadow-blue-100/50 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0 ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                <item.icon size={18} />
                <span className={`text-[10px] font-medium truncate max-w-full ${active ? 'font-semibold' : ''}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-all min-w-0"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}