import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshProjects, setSelectedProject } = useProject();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_type: 'Commercial',
    location: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'In Progress',
    client_name: '',
    project_manager: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      let url = '/projects?';
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setProjects(res.data || []);
    } catch (err) {
      showToast('Failed to load projects: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    if (!formData.location.trim()) errors.location = 'Site location is required';
    if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0) {
      errors.budget = 'Valid numeric budget is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        spent_budget: 0.0,
        completion_percentage: 0
      };
      const res = await api.post('/projects', payload);
      showToast('Project created successfully!', 'success');
      setShowCreateModal(false);
      setFormData({
        name: '',
        project_type: 'Commercial',
        location: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'In Progress',
        client_name: '',
        project_manager: '',
        notes: ''
      });
      fetchProjects();
      refreshProjects();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      showToast(`Project '${deleteTarget.name}' deleted.`, 'success');
      setDeleteTarget(null);
      fetchProjects();
      refreshProjects();
    } catch (err) {
      showToast('Deletion failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-accent-cyan" />
            Project Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track portfolio scope, budget execution, tasks, and structural milestones.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-navy-800 border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or location..."
            className="w-full bg-navy-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'In Progress', 'Planning', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-accent-cyan text-navy-950 font-bold'
                  : 'bg-navy-900 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton count={6} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No projects match your filter"
          description="Adjust your search criteria or create a new project record to begin monitoring."
          actionLabel="Create Project"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const spentPercent = p.budget > 0 ? Math.round((p.spent_budget / p.budget) * 100) : 0;
            return (
              <div
                key={p.id}
                className="group bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl hover:border-accent-cyan/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-accent-cyan border border-slate-700">
                      {p.project_type}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        p.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : p.status === 'Planning'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(p);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => {
                      setSelectedProject(p);
                      navigate(`/projects/${p.id}`);
                    }}
                    className="text-base font-bold text-slate-100 hover:text-accent-cyan transition cursor-pointer mb-1 leading-snug"
                  >
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{p.location}</span>
                  </div>

                  {/* Progress & Budget Progress */}
                  <div className="space-y-3 mb-4 p-3 rounded-xl bg-navy-900/60 border border-slate-800/80">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Construction Progress</span>
                        <span className="font-bold text-slate-200">{p.completion_percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-cyan rounded-full transition-all duration-500"
                          style={{ width: `${p.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Budget Spent</span>
                        <span className="font-mono text-slate-200">
                          ${(p.spent_budget / 1000000).toFixed(1)}M / ${(p.budget / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-orange rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(spentPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>PM: {p.project_manager || 'Unassigned'}</span>
                    <span>{p.pending_tasks || 0} active tasks</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Target: {p.end_date || 'TBD'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProject(p);
                      navigate(`/projects/${p.id}`);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-accent-cyan hover:underline"
                  >
                    View Project <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-800 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100 mb-1">Create New Construction Project</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter core project parameters. Records are persisted to the database.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Hudson Commercial Tower"
                  className={`w-full bg-navy-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-700 focus:border-accent-cyan'
                  }`}
                />
                {formErrors.name && <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Site Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. 500 West 33rd St, New York, NY"
                  className={`w-full bg-navy-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                    formErrors.location ? 'border-rose-500' : 'border-slate-700 focus:border-accent-cyan'
                  }`}
                />
                {formErrors.location && <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.location}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Budget ($) *</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="e.g. 48500000"
                    className={`w-full bg-navy-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                      formErrors.budget ? 'border-rose-500' : 'border-slate-700 focus:border-accent-cyan'
                    }`}
                  />
                  {formErrors.budget && <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.budget}</span>}
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Project Manager</label>
                  <input
                    type="text"
                    name="project_manager"
                    value={formData.project_manager}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah Jenkins, PMP"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Est. Completion Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Scope & Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Architectural scope, special zoning, concrete grades, etc."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-navy-700/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
                >
                  {isSubmitting ? 'Creating...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project Record?"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? This will permanently delete associated tasks, milestones, and daily logs.`}
        confirmText="Delete Project"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProjectsPage;
