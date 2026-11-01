import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Layers,
  ShieldAlert,
  DollarSign,
  Clock,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoModeBadge from '../components/common/DemoModeBadge';

export const ProjectPlanningPage = () => {
  const { selectedProject } = useProject();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    project_name: selectedProject?.name || 'Hudson Commercial Tower Phase II',
    scope: 'Construct a 38-story reinforced concrete tower with post-tensioned floor plates, unitized glass facade, and 3 basement parking levels.',
    project_type: 'Commercial',
    site_area: 14500,
    start_date: '2026-03-01',
    target_completion_date: '2028-02-28',
    budget: 52000000,
    team_size: 45,
    complexity: 'High'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('wbs');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload = {
        ...formData,
        site_area: Number(formData.site_area) || 0,
        budget: Number(formData.budget) || 0,
        team_size: Number(formData.team_size) || 10
      };
      const res = await api.post('/planning/generate', payload);
      setPlan(res.data);
      showToast('AI Construction Plan generated!', 'success');
    } catch (err) {
      showToast('Plan generation error: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    setIsSaving(true);
    try {
      await api.post('/planning/save', plan);
      showToast('Plan committed to database successfully!', 'success');
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskDurationChange = (taskId, newDuration) => {
    if (!plan) return;
    setPlan({
      ...plan,
      wbs: plan.wbs.map((t) => (t.id === taskId ? { ...t, duration_days: Number(newDuration) || 0 } : t))
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <CalendarDays className="w-6 h-6 text-accent-cyan" />
              AI Project Planning & CPM Sequencing
            </h1>
            <DemoModeBadge mode="demo" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated Work Breakdown Structure (WBS), trade dependencies, milestone targets, and risk mitigation matrix.
          </p>
        </div>

        {plan && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
            >
              <Printer className="w-4 h-4 text-accent-cyan" />
              Print Plan
            </button>
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Plan to Project'}
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner
        type="warning"
        title="Construction Project Management Disclaimer"
        text="PLANNING SUGGESTION ONLY: AI-generated durations, Work Breakdown Structures, and budget allocations are exploratory benchmarks based on standard industry averages. Local soil conditions, municipal permit cycles, material availability, and weather must be verified by a licensed Project Manager / Quantity Surveyor."
      />

      {/* Top Input Form */}
      <div className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl text-xs">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-orange" />
          Planning Scope Parameters
        </h3>

        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Name *</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Sector</label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Industrial">Industrial</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Execution Complexity</label>
              <select
                name="complexity"
                value={formData.complexity}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              >
                <option value="Low">Low (Standard Pre-engineered)</option>
                <option value="Medium">Medium (Mid-rise Cast-in-place)</option>
                <option value="High">High (High-rise / Deep Basements)</option>
                <option value="Critical">Critical (Tunneling / Rail / Heavy Civil)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Architectural Scope Description</label>
            <textarea
              rows={2}
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Site Footprint (sq.ft)</label>
              <input
                type="number"
                name="site_area"
                value={formData.site_area}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Allocated Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supervision Team Size</label>
              <input
                type="number"
                name="team_size"
                value={formData.team_size}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-gradient-to-r from-accent-cyan to-cyan-300 hover:brightness-110 transition shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Synthesizing WBS...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Generate AI Construction Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Plan Results */}
      {plan && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          {/* Plan Header Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Est. Duration</span>
              <span className="text-2xl font-bold text-slate-100 font-mono">{plan.estimated_duration_months} Months</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Sequenced across 5 CPM phases</span>
            </div>

            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Estimated Capital</span>
              <span className="text-2xl font-bold text-accent-cyan font-mono">${(plan.total_estimated_budget / 1000000).toFixed(1)}M</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Includes 8% contingency</span>
            </div>

            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">WBS Work Packages</span>
              <span className="text-2xl font-bold text-slate-100 font-mono">{plan.wbs?.length || 0} Tasks</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Direct predecessor dependencies</span>
            </div>

            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Key Milestones</span>
              <span className="text-2xl font-bold text-accent-orange font-mono">{plan.milestones?.length || 0} Critical</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Inspection hold-points</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('wbs')}
              className={`pb-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'wbs' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Work Breakdown Structure ({plan.wbs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`pb-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'milestones' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Milestone Sequence ({plan.milestones?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`pb-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'risks' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Risk Matrix & Mitigation ({plan.risks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`pb-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'budget' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              CSI Budget Allocation
            </button>
          </div>

          {/* WBS Tab */}
          {activeTab === 'wbs' && (
            <div className="bg-navy-800 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-navy-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Edit estimated task durations inline before saving to project schedule.</span>
                <span className="font-mono text-accent-cyan">Predecessor logic auto-linked</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">WBS Code</th>
                      <th className="p-3">Phase & Package</th>
                      <th className="p-3">Duration (Days)</th>
                      <th className="p-3">Dependencies</th>
                      <th className="p-3">Key Resources / Trades</th>
                      <th className="p-3">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {plan.wbs.map((task) => (
                      <tr key={task.id} className="hover:bg-navy-700/30 transition">
                        <td className="p-3 font-mono text-accent-cyan font-bold">{task.id}</td>
                        <td className="p-3 font-medium text-slate-100">
                          <span className="text-[10px] text-slate-400 block">{task.phase}</span>
                          {task.task_name}
                        </td>
                        <td className="p-3 w-32">
                          <input
                            type="number"
                            value={task.duration_days}
                            onChange={(e) => handleTaskDurationChange(task.id, e.target.value)}
                            className="w-20 bg-navy-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-accent-cyan"
                          />
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          {task.dependencies?.length > 0 ? task.dependencies.join(', ') : 'Start'}
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">{task.suggested_resources}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            task.risk_level === 'High'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {task.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.milestones.map((m, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-navy-800 border border-slate-800 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-accent-orange border border-orange-500/20 font-bold">
                      Target: Month {m.target_month}
                    </span>
                    <span className="text-[10px] text-slate-500">Hold Point</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{m.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.deliverables}</p>
                </div>
              ))}
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-3">
              {plan.risks.map((r, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-navy-800 border border-slate-800 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent-orange" />
                      <h4 className="text-xs font-bold text-slate-100">{r.risk}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        Prob: {r.probability}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        Impact: {r.impact}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-300 block mb-0.5">Mitigation Strategy:</strong>
                    {r.mitigation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.budget_allocation.map((b, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-navy-800 border border-slate-800 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{b.category}</span>
                    <span className="text-xs font-bold text-accent-cyan font-mono">{b.percentage}%</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-100 font-mono block">
                    ${b.amount.toLocaleString()}
                  </span>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-orange rounded-full" style={{ width: `${b.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectPlanningPage;
