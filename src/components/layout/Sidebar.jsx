import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  SearchCode,
  Calculator,
  CalendarDays,
  CloudSun,
  Bot,
  ClipboardList,
  BookOpen,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  HardHat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: Building2 },
  { name: 'Site Safety AI', path: '/safety', icon: ShieldAlert, badge: 'AI' },
  { name: 'Crack Detection', path: '/cracks', icon: SearchCode, badge: 'Vision' },
  { name: 'Real Estate Valuation', path: '/valuation', icon: Calculator },
  { name: 'Project Planning', path: '/planning', icon: CalendarDays },
  { name: 'Weather Advisory', path: '/weather', icon: CloudSun },
  { name: 'Construction Assistant', path: '/assistant', icon: Bot, badge: 'Chat' },
  { name: 'Daily Site Log', path: '/daily-reports', icon: ClipboardList },
  { name: 'Knowledge Center', path: '/knowledge', icon: BookOpen },
  { name: 'Reports & Analytics', path: '/reports', icon: FileBarChart2 },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'Administrator': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Project Manager': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Safety Officer': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <aside
      className={`relative flex flex-col bg-navy-900 border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Platform Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-navy-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 shrink-0">
            <HardHat className="w-6 h-6 text-navy-950" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                BuildSense <span className="text-accent-orange text-xs px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                Construction Intelligence
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-cyan/15 to-transparent text-accent-cyan border-l-2 border-accent-cyan shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-500/10 text-accent-cyan border border-cyan-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User / Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-navy-950/30">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-navy-800/60 border border-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-accent-cyan shrink-0">
            <User className="w-4 h-4" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {user?.full_name || 'Site User'}
              </p>
              <span className={`inline-block text-[10px] px-1.5 py-0.2 mt-0.5 rounded border font-medium ${getRoleBadgeStyle(role)}`}>
                {role}
              </span>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
