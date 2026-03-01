import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  Building,
  Mail,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  BarChart3,
  HelpCircle,
  MessageSquare,
  Phone
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'deputy_admin' || user?.email === 'florian@unyted.world';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/leads', label: 'Leads', icon: <Users className="w-5 h-5" /> },
    { path: '/contacts', label: 'Contacts', icon: <Users className="w-5 h-5" /> },
    { path: '/deals', label: 'Deals', icon: <Target className="w-5 h-5" /> },
    { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { path: '/pipeline', label: 'Pipeline', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/companies', label: 'Companies', icon: <Building className="w-5 h-5" /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Mail className="w-5 h-5" /> },
    { path: '/chat', label: 'Team Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { path: '/calls', label: 'Calls', icon: <Phone className="w-5 h-5" /> },
    { divider: true },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { path: '/support', label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
    { path: '/admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, adminOnly: true },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-layout">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img 
            src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/u9efkh3m_earnrm_logo_horizontal_light_notag_purpleword.png" 
            alt="earnrm" 
            className="h-8"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/9ans91q7_earnrm_mark_purple.svg" 
                alt="earnrm" 
                className="h-9 w-9"
              />
              <span className="text-xl font-semibold text-slate-900">earnrm</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item, index) =>
                item.divider ? (
                  <div key={index} className="my-4 border-t border-slate-100" />
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-[#A100FF] font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive(item.path) && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                )
              )}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-[#A100FF] font-medium">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate" data-testid="sidebar-user-name">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              onClick={handleLogout}
              data-testid="sidebar-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
