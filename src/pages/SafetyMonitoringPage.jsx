import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  FileDown,
  Printer,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoModeBadge from '../components/common/DemoModeBadge';

const SAMPLE_SAFETY_IMAGES = [
  {
    id: 'sample-1',
    name: 'Scaffold Perimeter Bay (Level 21)',
    category: 'Fall Hazards & Guardrails',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
    description: 'Worker near perimeter deck with uncompleted intermediate guardrails.'
  },
  {
    id: 'sample-2',
    name: 'Excavation & Shoring Trench',
    category: 'Trenching & PPE',
    previewUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'Subgrade utility pipe trench with active excavator operating in swing radius.'
  },
  {
    id: 'sample-3',
    name: 'Structural Steel Erection Deck',
    category: 'PPE & Fall Arrest',
    previewUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    description: 'Ironworkers setting columns with double lanyard tie-offs.'
  }
];

const CATEGORIES = [
  'PPE Compliance (Hardhat, Vest, Boots)',
  'Fall Hazards & Open Slab Edges',
  'Scaffold Guardrails & Toeboards',
  'Material Storage & Stacking',
  'Trip Hazards & Housekeeping',
  'Crane Radius & Heavy Equipment',
  'Electrical Lines & Cable Protection'
];

export const SafetyMonitoringPage = () => {
  const { selectedProject } = useProject();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(SAMPLE_SAFETY_IMAGES[0].previewUrl);
  const [selectedSample, setSelectedSample] = useState(SAMPLE_SAFETY_IMAGES[0]);
  const [selectedCategories, setSelectedCategories] = useState([
    'PPE Compliance (Hardhat, Vest, Boots)',
    'Fall Hazards & Open Slab Edges',
    'Scaffold Guardrails & Toeboards'
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('demo');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analysis/safety');
      setHistory(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch safety history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedSample(null);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setSelectedFile(null);
    setPreviewUrl(sample.previewUrl);
    setAnalysisResult(null);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    if (selectedProject) {
      formData.append('project_id', selectedProject.id);
    }
    formData.append('categories', selectedCategories.join(', '));

    try {
      const res = await api.post('/analysis/safety', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
      setAnalysisMode(res.mode || 'demo');
      showToast('Safety analysis completed!', 'success');
      fetchHistory();
    } catch (err) {
      showToast('Analysis failed: ' + err.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-orange-500/15 text-accent-orange border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-accent-orange" />
              AI Site Safety Monitoring
            </h1>
            <DemoModeBadge mode={analysisMode} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal visual hazard identification for OSHA/NEBOSH compliance: PPE, fall edges, guardrails, and housekeeping.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
          >
            <Printer className="w-4 h-4 text-accent-cyan" />
            Print Safety Audit
          </button>
        )}
      </div>

      {/* Safety Mandatory Disclaimer Banner */}
      <DisclaimerBanner
        type="warning"
        title="OSHA Visual Screening Disclaimer"
        text="PRELIMINARY AI OBSERVATION ONLY: This visual assessment is generated by an automated computer vision model and must NOT be relied upon as a replacement for qualified site safety inspections. Observations are limited strictly to visible image areas. An absence of identified hazards does not imply site compliance. Qualified human review is required before closing any findings."
      />

      {/* Two Column Layout: Image & Controls on Left, Analysis Findings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Upload & Preview Card */}
          <div className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent-cyan" />
              1. Site Photograph Input
            </h3>

            {/* Preview Box */}
            <div className="relative aspect-video rounded-xl bg-navy-900 border border-slate-700/80 overflow-hidden mb-4 group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Site Inspection Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <span>No image loaded</span>
                </div>
              )}

              {selectedSample && (
                <div className="absolute bottom-2 left-2 right-2 bg-navy-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300">
                  <span className="font-semibold text-accent-cyan">Sample:</span> {selectedSample.name}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-3 mb-4">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-navy-900 border border-dashed border-slate-700 text-slate-300 hover:border-accent-cyan hover:text-white transition">
                <Upload className="w-4 h-4 text-accent-cyan" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Sample Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Or select high-resolution site sample:</span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_SAFETY_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`relative rounded-lg overflow-hidden border transition aspect-video ${
                      selectedSample?.id === sample.id
                        ? 'border-accent-cyan ring-2 ring-accent-cyan/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.previewUrl} alt={sample.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-navy-950/80 text-[9px] font-medium text-slate-200 truncate px-1 py-0.5">
                      {sample.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Category Selection */}
          <div className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              2. Target Inspection Audit Categories
            </h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition ${
                      active
                        ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan'
                        : 'bg-navy-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${
                        active
                          ? 'bg-accent-cyan text-navy-950 border-accent-cyan'
                          : 'border-slate-700 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="mt-5 w-full py-3 rounded-xl font-bold text-xs text-navy-950 bg-gradient-to-r from-accent-orange via-amber-500 to-accent-orange hover:brightness-110 transition shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Auditing Visual Telemetry...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execute AI Safety Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult && !isAnalyzing && (
            <div className="bg-navy-800/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 rounded-2xl bg-navy-800 text-accent-cyan mb-4 border border-slate-700">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Ready for Safety Audit</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                Choose a site photograph or select a sample image on the left, check your inspection categories, and click "Execute AI Safety Analysis".
              </p>
              <div className="text-[11px] text-slate-500">
                Supported: OSHA 1926 subparts M (Fall Protection), E (PPE), L (Scaffolding).
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] animate-pulse">
              <Sparkles className="w-12 h-12 text-accent-orange animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-100 mb-2">Analyzing Image Telemetry...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Parsing visual regions for missing hard hats, harness attachments, intermediate rails, and egress clearance.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* Summary Header */}
              <div className="p-5 rounded-2xl bg-navy-800 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Risk Level:</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${getSeverityBadge(analysisResult.overall_severity)}`}>
                      {analysisResult.overall_severity} Risk
                    </span>
                  </div>
                  <DemoModeBadge mode={analysisMode} />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Findings Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Identified Hazard Observations ({analysisResult.findings?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 lowercase">sorted by priority</span>
                </h3>

                {analysisResult.findings?.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-navy-800 border border-slate-800/90 shadow-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider block mb-0.5">
                          {finding.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100">{finding.description}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800/80 text-xs">
                      <span className="font-semibold text-slate-300 block mb-1">Recommended Remediation Action:</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{finding.recommended_action}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Suggested Priority: <strong className="text-slate-200">{finding.suggested_priority || 'Immediate'}</strong></span>
                      <span className="font-mono text-slate-400">Model Confidence: {Math.round(finding.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limitations Box */}
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Model Limitations & Verification Bounds
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  {analysisResult.limitations?.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Inspections Table */}
      <div className="mt-12 bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Inspection Audit History</span>
          <span className="text-xs text-slate-400 font-normal">{history.length} records stored in database</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Audit ID</th>
                <th className="p-3">Image Name</th>
                <th className="p-3">Summary Observation</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No prior safety audits logged.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-700/30 transition">
                    <td className="p-3 font-mono text-accent-cyan">#SAF-{h.id}</td>
                    <td className="p-3 font-medium text-slate-200">{h.image_name || 'site_photo.jpg'}</td>
                    <td className="p-3 max-w-xs truncate text-slate-400">{h.summary}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(h.overall_severity)}`}>
                        {h.overall_severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {h.is_demo ? (
                        <span className="text-amber-400">demo</span>
                      ) : (
                        <span className="text-emerald-400">live</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SafetyMonitoringPage;
