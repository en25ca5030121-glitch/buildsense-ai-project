import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Users,
  Wrench,
  Package,
  Truck,
  CloudSun,
  ShieldCheck,
  Clock,
  Printer,
  FileDown,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const DailySiteReportPage = () => {
  const { projects, selectedProject } = useProject();
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [formData, setFormData] = useState({
    project_id: selectedProject?.id || '',
    report_date: new Date().toISOString().split('T')[0],
    work_completed: '',
    workers_count: 45,
    equipment_used: 'Potain Tower Crane (1), CAT 320 Excavator (2), Concrete Pump Truck',
    materials_consumed: '420 cu.yds Ready-mix concrete (4,000 PSI), 18 tons #6 & #8 rebar',
    deliveries: '4 transit mixers, 2 flatbeds structural steel members',
    weather_notes: 'Fair, 22°C, Wind 14 km/h NW. Optimal curing conditions.',
    safety_incidents: 'None reported. Conducted 10-minute morning toolbox talk on scaffold tie-offs.',
    delays: 'None',
    next_day_plan: 'Strip forms on Level 22 core wall. Begin MEP rough-in layout on Deck 20.',
    supervisor_notes: 'Concrete slump tests yielded consistent 4.5-inch workability.',
    supervisor_name: 'Sarah Jenkins, PMP'
  });

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let url = '/reports/daily';
      if (selectedProject) url += `?project_id=${selectedProject.id}`;
      const res = await api.get(url);
      setReports(res.data || []);
    } catch (err) {
      showToast('Failed to load daily site reports: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    if (selectedProject) {
      setFormData((prev) => ({ ...prev, project_id: selectedProject.id }));
    }
  }, [selectedProject]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!formData.project_id) {
      showToast('Please select an associated project', 'warning');
      return;
    }
    if (!formData.work_completed.trim()) {
      showToast('Summary of work completed is required', 'warning');
      return;
    }

    try {
      const payload = {
        ...formData,
        project_id: Number(formData.project_id),
        workers_count: Number(formData.workers_count) || 0
      };
      await api.post('/reports/daily', payload);
      showToast('Daily Site Log filed successfully!', 'success');
      setShowCreateModal(false);
      fetchReports();
    } catch (err) {
      showToast('Failed to submit report: ' + err.message, 'error');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/reports/export/csv/daily', '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-accent-cyan" />
            Daily Site Assistant & Superintendent Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized daily documentation: work progress, on-site headcount, equipment, materials, delays, and safety.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
          >
            <FileDown className="w-4 h-4 text-accent-cyan" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
          >
            <Plus className="w-4 h-4" />
            File Daily Log
          </button>
        </div>
      </div>

      {/* Reports Feed & Detail Modal */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : reports.length === 0 ? (
        <div className="bg-navy-800/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-accent-cyan mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-100 mb-1">No Daily Reports Logged</h3>
          <p className="text-xs text-slate-400 mb-6">
            Record today's trades, batch pours, deliveries, and supervisor notes to keep project stakeholders informed.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition"
          >
            File First Daily Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-navy-800 border border-slate-800/90 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-accent-cyan font-bold text-xs">#LOG-{r.id}</span>
                  <span className="text-sm font-bold text-slate-100">{r.project_name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-navy-900 border border-slate-700 text-slate-300">
                    {r.report_date}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-accent-orange" />
                    <strong>{r.workers_count}</strong> Workers Present
                  </span>
                  <span>Supervisor: <strong className="text-slate-200">{r.supervisor_name}</strong></span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Work Completed</span>
                <p className="text-xs text-slate-200 leading-relaxed">{r.work_completed}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase mb-1">Equipment Used</span>
                  <p className="text-slate-300 text-[11px]">{r.equipment_used || 'Standard hand tools'}</p>
                </div>
                <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase mb-1">Materials & Deliveries</span>
                  <p className="text-slate-300 text-[11px]">{r.materials_consumed || 'Routine staging'}</p>
                </div>
                <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase mb-1">Weather & Site Access</span>
                  <p className="text-slate-300 text-[11px]">{r.weather_notes || 'Clear'}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
                <span>Next Day Plan: <strong className="text-slate-300">{r.next_day_plan || 'Continue ongoing packages'}</strong></span>
                <span className="text-emerald-400 font-medium">Safety: {r.safety_incidents}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Daily Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-800 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1">File Daily Site Superintendent Report</h3>
            <p className="text-slate-400 mb-4">Complete today's operational log for audit and payroll records.</p>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Associated Project *</label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Report Date *</label>
                  <input
                    type="date"
                    name="report_date"
                    value={formData.report_date}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Completed Today *</label>
                <textarea
                  rows={3}
                  name="work_completed"
                  value={formData.work_completed}
                  onChange={handleInputChange}
                  placeholder="Detail trade activities, slabs poured, framing erected, MEP rough-ins..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Workers On Site</label>
                  <input
                    type="number"
                    name="workers_count"
                    value={formData.workers_count}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Site Supervisor Name</label>
                  <input
                    type="text"
                    name="supervisor_name"
                    value={formData.supervisor_name}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Heavy Equipment Deployed</label>
                  <input
                    type="text"
                    name="equipment_used"
                    value={formData.equipment_used}
                    onChange={handleInputChange}
                    placeholder="Tower cranes, excavators, pumps..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Materials & Bulk Deliveries</label>
                  <input
                    type="text"
                    name="materials_consumed"
                    value={formData.materials_consumed}
                    onChange={handleInputChange}
                    placeholder="Concrete volumes, steel tonnage, rebar..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weather & Site Conditions</label>
                  <input
                    type="text"
                    name="weather_notes"
                    value={formData.weather_notes}
                    onChange={handleInputChange}
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Safety Observations / Incidents</label>
                  <input
                    type="text"
                    name="safety_incidents"
                    value={formData.safety_incidents}
                    onChange={handleInputChange}
                    placeholder="Toolbox talk topics, near-misses..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Planned Activities for Tomorrow</label>
                <input
                  type="text"
                  name="next_day_plan"
                  value={formData.next_day_plan}
                  onChange={handleInputChange}
                  placeholder="Key batch pours, inspections scheduled..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-navy-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-navy-950 bg-accent-cyan hover:bg-cyan-300"
                >
                  Submit Daily Site Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySiteReportPage;
