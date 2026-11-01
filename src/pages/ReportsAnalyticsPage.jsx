import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  FileDown,
  Printer,
  Filter,
  Building,
  ShieldAlert,
  SearchCode,
  Calculator,
  CalendarDays,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const ReportsAnalyticsPage = () => {
  const { projects, selectedProject } = useProject();
  const { showToast } = useToast();

  const [overview, setOverview] = useState(null);
  const [activeReportType, setActiveReportType] = useState('projects');
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/reports/central-overview');
      setOverview(res.data);
    } catch (err) {
      console.warn('Failed to load reporting overview:', err);
    }
  };

  const fetchReportDataset = async (type) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (type === 'projects') endpoint = '/projects';
      else if (type === 'safety') endpoint = '/analysis/safety';
      else if (type === 'cracks') endpoint = '/analysis/cracks';
      else if (type === 'valuations') endpoint = '/valuation';
      else if (type === 'daily') endpoint = '/reports/daily';
      else if (type === 'planning') endpoint = '/planning';

      const res = await api.get(endpoint);
      setRecords(res.data || []);
    } catch (err) {
      showToast('Error loading report records: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchReportDataset(activeReportType);
  }, [activeReportType]);

  const handleExportCsv = (dataset) => {
    window.open(`/api/reports/export/csv/${dataset}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileBarChart2 className="w-6 h-6 text-accent-cyan" />
            Central Reports & Audit Exports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official project audit trails: compile safety records, crack logs, daily superintendent reports, and asset valuations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
          >
            <Printer className="w-4 h-4 text-accent-cyan" />
            Print Current View
          </button>
          {['projects', 'safety', 'daily'].includes(activeReportType) && (
            <button
              onClick={() => handleExportCsv(activeReportType)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
            >
              <FileDown className="w-4 h-4" />
              Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Counts Banner */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Projects</span>
            <span className="text-xl font-bold text-slate-100 font-mono">{overview.counts.projects}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Safety Audits</span>
            <span className="text-xl font-bold text-accent-orange font-mono">{overview.counts.safety_inspections}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Crack Scans</span>
            <span className="text-xl font-bold text-accent-cyan font-mono">{overview.counts.crack_inspections}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Valuations</span>
            <span className="text-xl font-bold text-slate-100 font-mono">{overview.counts.valuations}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Daily Logs</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{overview.counts.daily_reports}</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-800 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">CPM Plans</span>
            <span className="text-xl font-bold text-slate-100 font-mono">{overview.counts.project_plans}</span>
          </div>
        </div>
      )}

      {/* Dataset Selector Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { key: 'projects', label: 'Projects Status Report' },
          { key: 'safety', label: 'Site Safety Inspections' },
          { key: 'cracks', label: 'Crack & Structural Logs' },
          { key: 'valuations', label: 'Real Estate Valuations' },
          { key: 'daily', label: 'Daily Superintendent Logs' },
          { key: 'planning', label: 'Project CPM Plans' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReportType(tab.key)}
            className={`pb-3 border-b-2 whitespace-nowrap transition ${
              activeReportType === tab.key
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No records stored for this dataset yet. Use the corresponding module to log new entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Record ID</th>
                  <th className="p-3">Primary Identifier</th>
                  <th className="p-3">Summary / Details</th>
                  <th className="p-3">Status / Metrics</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-navy-700/30 transition">
                    <td className="p-3 font-mono text-accent-cyan">
                      #{activeReportType.toUpperCase().slice(0, 3)}-{r.id}
                    </td>
                    <td className="p-3 font-semibold text-slate-100">
                      {r.name || r.image_name || r.property_type || r.project_name || `Report #${r.id}`}
                    </td>
                    <td className="p-3 max-w-sm truncate text-slate-300">
                      {r.summary || r.notes || r.work_completed || r.scope || r.location}
                    </td>
                    <td className="p-3">
                      {r.status && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                          {r.status} ({r.completion_percentage}%)
                        </span>
                      )}
                      {r.overall_severity && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-slate-900 border-slate-700 text-amber-300">
                          {r.overall_severity} Risk
                        </span>
                      )}
                      {r.estimated_avg && (
                        <span className="font-mono text-emerald-400 font-bold">
                          ${r.estimated_avg.toLocaleString()}
                        </span>
                      )}
                      {r.workers_count !== undefined && (
                        <span className="font-mono text-slate-300">
                          {r.workers_count} workers
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : r.report_date || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
