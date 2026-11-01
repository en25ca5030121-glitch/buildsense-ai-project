import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldAlert,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  CloudSun,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  HardHat,
  SearchCode,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

import api from '../services/api';
import StatCard from '../components/common/StatCard';
import { CardSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import DemoModeBadge from '../components/common/DemoModeBadge';
import { useProject } from '../context/ProjectContext';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { metrics, project_progress, weekly_activity, safety_trend, recent_activity, upcoming_deadlines, ai_insights, weather_summary } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-accent-orange/15 border border-orange-500/30 text-accent-orange">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-100 tracking-tight">
                Site Intelligence Overview
              </h1>
              <DemoModeBadge mode="demo" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Project Focus: <span className="text-accent-cyan font-semibold">{selectedProject?.name || 'All Active Sites'}</span> • Real-time multimodal audits & CPM controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/safety')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
          >
            <ShieldAlert className="w-4 h-4" />
            Run AI Safety Scan
          </button>
          <button
            onClick={() => navigate('/cracks')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 hover:bg-navy-700 border border-slate-700/80 transition"
          >
            <SearchCode className="w-4 h-4 text-accent-orange" />
            Crack Inspection
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={metrics.total_projects.title}
          value={metrics.total_projects.value}
          subtext={metrics.total_projects.subtext}
          trend={metrics.total_projects.trend}
          icon={Building2}
          linkTo="/projects"
        />
        <StatCard
          title={metrics.active_projects.title}
          value={metrics.active_projects.value}
          subtext={metrics.active_projects.subtext}
          trend={metrics.active_projects.trend}
          status="success"
          icon={Activity}
          linkTo="/projects"
        />
        <StatCard
          title={metrics.safety_issues.title}
          value={metrics.safety_issues.value}
          subtext={metrics.safety_issues.subtext}
          trend={metrics.safety_issues.trend}
          status={metrics.safety_issues.status}
          icon={ShieldAlert}
          linkTo="/safety"
          accentColor="orange"
        />
        <StatCard
          title={metrics.pending_inspections.title}
          value={metrics.pending_inspections.value}
          subtext={metrics.pending_inspections.subtext}
          trend={metrics.pending_inspections.trend}
          icon={Clock}
          linkTo="/projects"
        />
        <StatCard
          title={metrics.estimated_budget.title}
          value={metrics.estimated_budget.value}
          subtext={metrics.estimated_budget.subtext}
          trend={metrics.estimated_budget.trend}
          status="success"
          icon={DollarSign}
          linkTo="/valuation"
        />
        <StatCard
          title={metrics.completion_percentage.title}
          value={metrics.completion_percentage.value}
          subtext={metrics.completion_percentage.subtext}
          trend={metrics.completion_percentage.trend}
          status="success"
          icon={CheckCircle2}
          linkTo="/projects"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-cyan" />
                Project Progress (Planned vs Actual %)
              </h3>
              <p className="text-xs text-slate-400">Baseline schedule conformance across active projects</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project_progress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="planned" name="Planned %" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual %" fill="#FF8A00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Workforce & Man-Hours */}
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Weekly On-Site Workforce & Productive Hours
              </h3>
              <p className="text-xs text-slate-400">Headcount vs total man-hours logged</p>
            </div>
            <button
              onClick={() => navigate('/daily-reports')}
              className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
            >
              Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly_activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="hours" name="Man-Hours" stroke="#22D3EE" fillOpacity={1} fill="url(#colorHours)" />
                <Line type="monotone" dataKey="workers" name="Headcount" stroke="#F59E0B" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Multi-Widget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Advisory Card */}
        <div
          onClick={() => navigate('/weather')}
          className="bg-navy-800 border border-slate-800/80 hover:border-accent-cyan/50 rounded-2xl p-5 shadow-xl transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Weather Advisory</span>
              <CloudSun className="w-5 h-5 text-accent-cyan" />
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-slate-100">{weather_summary.temp}</span>
              <span className="text-sm font-semibold text-slate-300">{weather_summary.condition}</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 mb-4">
              <p>Location: <span className="text-slate-200">{weather_summary.city}</span></p>
              <p>Wind Telemetry: <span className="text-slate-200">{weather_summary.wind}</span></p>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{weather_summary.advisory_badge}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Wind speeds within permissible crane hoisting thresholds (under 35 km/h). Concrete curing condition: Optimal.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-accent-cyan">
            <span>Open Weather Advisory Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* AI Project Insights */}
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Executive Insights</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {ai_insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-navy-900/50 border border-slate-800/70 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0"></div>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/assistant')}
            className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-accent-cyan hover:underline w-full text-left"
          >
            <span>Ask Construction Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upcoming Critical Deadlines */}
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Milestone Milestones</span>
              <Calendar className="w-5 h-5 text-accent-orange" />
            </div>
            <div className="space-y-2.5">
              {upcoming_deadlines.map((dl) => (
                <div key={dl.id} className="p-3 rounded-xl bg-navy-900/50 border border-slate-800/70 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-200 truncate">{dl.milestone}</p>
                    <p className="text-[11px] text-slate-400 truncate">{dl.project_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-accent-orange border border-orange-500/20 font-bold block mb-0.5">
                      {dl.due_date}
                    </span>
                    <span className="text-[10px] text-slate-500">{dl.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/planning')}
            className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-accent-cyan hover:underline w-full text-left"
          >
            <span>View AI Schedule & CPM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
