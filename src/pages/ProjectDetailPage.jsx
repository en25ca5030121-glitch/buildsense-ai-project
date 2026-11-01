import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Layers,
  FileText,
  ShieldAlert,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isLoading, setIsLoading] = useState(true);

  // New Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    assigned_to: '',
    status: 'To Do',
    progress: 0
  });

  // New Milestone Modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'Pending'
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const [projRes, tasksRes, mRes, dailyRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/milestones`),
        api.get(`/reports/daily?project_id=${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data || []);
      setMilestones(mRes.data || []);
      setDailyReports(dailyRes.data || []);
    } catch (err) {
      showToast('Failed to load project details: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) {
      showToast('Task title is required', 'warning');
      return;
    }
    try {
      await api.post(`/projects/${id}/tasks`, taskData);
      showToast('Task created successfully', 'success');
      setShowTaskModal(false);
      setTaskData({
        title: '',
        description: '',
        due_date: '',
        priority: 'Medium',
        assigned_to: '',
        status: 'To Do',
        progress: 0
      });
      const tRes = await api.get(`/projects/${id}/tasks`);
      setTasks(tRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneData.title.trim() || !milestoneData.target_date) {
      showToast('Title and target date are required', 'warning');
      return;
    }
    try {
      await api.post(`/projects/${id}/milestones`, milestoneData);
      showToast('Milestone created', 'success');
      setShowMilestoneModal(false);
      setMilestoneData({ title: '', description: '', target_date: '', status: 'Pending' });
      const mRes = await api.get(`/projects/${id}/milestones`);
      setMilestones(mRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    const nextProgress = nextStatus === 'Completed' ? 100 : 50;
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus, progress: nextProgress });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, progress: nextProgress } : t))
      );
      showToast(`Task status updated to ${nextStatus}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task removed', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      showToast('Project deleted', 'success');
      navigate('/projects');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (isLoading || !project) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={3} />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const spentPercent = project.budget > 0 ? Math.round((project.spent_budget / project.budget) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-100">{project.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-accent-cyan border border-cyan-500/20">
                {project.project_type}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {project.location} • Client: {project.client_name || 'Direct Build'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeleteTarget(project)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        </div>
      </div>

      {/* Project Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
          <span className="text-lg font-bold text-slate-100">{project.status}</span>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{project.completion_percentage}% Completed</span>
        </div>

        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Approved Budget</span>
          <span className="text-lg font-bold text-slate-100 font-mono">${(project.budget / 1000000).toFixed(2)}M</span>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent-orange rounded-full" style={{ width: `${Math.min(spentPercent, 100)}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">${(project.spent_budget / 1000000).toFixed(2)}M spent ({spentPercent}%)</span>
        </div>

        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Timeline Window</span>
          <span className="text-sm font-semibold text-slate-200 block truncate">
            {project.start_date || 'Start'} → {project.end_date || 'Target'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">Project Manager: {project.project_manager || 'None'}</span>
        </div>

        <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Site Team</span>
          <span className="text-sm font-semibold text-slate-200 block truncate">
            {project.team_members?.length || 1} Assigned Staff
          </span>
          <span className="text-[10px] text-accent-cyan mt-2 block">{tasks.filter(t => t.status === 'Completed').length} of {tasks.length} tasks closed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'tasks' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Construction Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'milestones' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'daily' ? 'border-accent-cyan text-accent-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Daily Site Logs ({dailyReports.length})
        </button>
      </div>

      {/* Tab Content: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Workforce & Trade Tasks</h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>

          <div className="bg-navy-800 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Task Description</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Progress</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No tasks assigned yet. Click "Add Task" to record work packages.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-700/30 transition">
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleTaskStatus(t)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {t.status}
                        </button>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">
                        {t.title}
                        {t.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          t.priority === 'Critical'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : t.priority === 'High'
                            ? 'bg-orange-500/10 text-accent-orange border-orange-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{t.assigned_to || 'Unassigned'}</td>
                      <td className="p-3.5 font-mono text-slate-400">{t.due_date || 'N/A'}</td>
                      <td className="p-3.5 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${t.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{t.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Structural & Engineering Milestones</h3>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-navy-800/40 rounded-2xl border border-dashed border-slate-800">
                No milestones defined. Add major project deliverables above.
              </div>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-navy-800 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        m.status === 'Reached'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}>
                        {m.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{m.target_date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 mb-1">{m.title}</h4>
                    {m.description && <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Daily Site Reports */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Site Superintendent Logs</h3>
            <button
              onClick={() => navigate('/daily-reports')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-accent-cyan bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
            >
              File Daily Site Log
            </button>
          </div>

          <div className="space-y-3">
            {dailyReports.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-navy-800/40 rounded-2xl border border-dashed border-slate-800 text-xs">
                No daily site reports filed for this project yet.
              </div>
            ) : (
              dailyReports.map((dr) => (
                <div key={dr.id} className="p-4 rounded-2xl bg-navy-800 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-200">Report Date: {dr.report_date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {dr.workers_count} Workers On Site
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{dr.work_completed}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1.5">
                      <span>Supervisor: {dr.supervisor_name}</span>
                      <span>Weather: {dr.weather_notes}</span>
                      <span>Delays: {dr.delays}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-800 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1">Add Construction Task</h3>
            <p className="text-slate-400 mb-4">Define a specific work package or trade hold point.</p>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="e.g. Inspect Level 24 Shear Wall Rebar"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Trade instructions, quality specifications..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskData.due_date}
                    onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assignee</label>
                <input
                  type="text"
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                  placeholder="e.g. David Chen, PE"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-navy-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-800 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1">Add Milestone</h3>
            <p className="text-slate-400 mb-4">Set target completion dates for key deliverables.</p>
            <form onSubmit={handleCreateMilestone} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Milestone Title *</label>
                <input
                  type="text"
                  value={milestoneData.title}
                  onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
                  placeholder="e.g. Superstructure Top-Out Pour"
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Date *</label>
                <input
                  type="date"
                  value={milestoneData.target_date}
                  onChange={(e) => setMilestoneData({ ...milestoneData, target_date: e.target.value })}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deliverables Description</label>
                <textarea
                  rows={2}
                  value={milestoneData.description}
                  onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })}
                  placeholder="Key deliverables and acceptance criteria..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-navy-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project?"
        message={`Delete '${deleteTarget?.name}' and all associated tasks and reports? This cannot be undone.`}
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProjectDetailPage;
