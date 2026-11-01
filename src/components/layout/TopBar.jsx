import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Calendar,
  X,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TopBar = () => {
  const { projects, selectedProject, setSelectedProject } = useProject();
  const { user, role, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'High Wind Telemetry Alert',
      desc: 'Wind gusts exceeding 35 km/h predicted for Thursday. Check crane lifting schedules.',
      time: '15m ago'
    },
    {
      id: 2,
      type: 'safety',
      title: 'AI Safety Scan Required Review',
      desc: 'Perimeter scaffolding mid-rail observation logged at Level 21.',
      time: '1h ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'Concrete Cylinder Test Passed',
      desc: 'Hudson Tower Deck 22 achieved 4,200 PSI 14-day compressive strength.',
      time: '3h ago'
    }
  ];

  const handleRoleSwitch = async (newRole) => {
    try {
      await demoLogin(newRole);
      setShowRoleMenu(false);
      showToast(`Switched active profile to ${newRole}`, 'success');
    } catch {
      showToast('Failed to switch role', 'error');
    }
  };

  return (
    <header className="h-16 bg-navy-900 border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-4 z-20">
      {/* Left: Active Project Selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-navy-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200">
            <Building className="w-4 h-4 text-accent-cyan" />
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === Number(e.target.value));
                if (proj) setSelectedProject(proj);
              }}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-4"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-navy-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
              {selectedProject?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, inspections, WBS tasks, reports... (Ctrl+K)"
            className="w-full bg-navy-800/60 border border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan/60 transition"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-navy-800 border border-slate-700/60 text-slate-200 hover:border-slate-600 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent-orange" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-accent-cyan">{role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-navy-800 border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                Switch Demo Persona
              </div>
              {['Administrator', 'Project Manager', 'Site Engineer', 'Safety Officer'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-navy-700/60 transition ${
                    role === r ? 'text-accent-cyan font-semibold bg-navy-700/30' : 'text-slate-300'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-navy-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-orange animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-orange"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-navy-800 border border-slate-700/90 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Site Alerts & Telemetry</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500/10 text-accent-orange border border-orange-500/20 font-bold">
                    3 New
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-navy-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {n.type === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      ) : n.type === 'safety' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Calendar className="w-4 h-4 text-accent-cyan" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
