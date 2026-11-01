import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  ShieldAlert,
  Printer,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoModeBadge from '../components/common/DemoModeBadge';

const SAMPLE_CRACK_IMAGES = [
  {
    id: 'crack-1',
    name: 'Shear Wall Beam Junction',
    structureType: 'Shear Wall',
    notes: 'Basement Sub-grade Level 4, Gridline C-4',
    previewUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
    description: 'Diagonal shear fracture trace near concrete lintel corner.'
  },
  {
    id: 'crack-2',
    name: 'Reinforced Concrete Column',
    structureType: 'Column',
    notes: 'Level 2 Parking Deck, Column P-18',
    previewUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    description: 'Vertical compressive settlement hairline traces.'
  },
  {
    id: 'crack-3',
    name: 'Post-Tensioned Slab Underside',
    structureType: 'Slab',
    notes: 'Level 12 Deck soffit between spans 3 and 4',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    description: 'Plastic shrinkage crazing web across render surface.'
  }
];

const STRUCTURE_TYPES = ['Shear Wall', 'Column', 'Slab', 'Beam', 'Foundation Footing', 'Retaining Wall'];

export const CrackAnalysisPage = () => {
  const { selectedProject } = useProject();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(SAMPLE_CRACK_IMAGES[0].previewUrl);
  const [selectedSample, setSelectedSample] = useState(SAMPLE_CRACK_IMAGES[0]);
  const [structureType, setStructureType] = useState('Shear Wall');
  const [locationNotes, setLocationNotes] = useState('Basement Sub-grade Level 4, Gridline C-4');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('demo');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/analysis/cracks');
      setHistory(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch crack history:', err);
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
    setStructureType(sample.structureType);
    setLocationNotes(sample.notes);
    setAnalysisResult(null);
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
    formData.append('structure_type', structureType);
    formData.append('location_notes', locationNotes);

    try {
      const res = await api.post('/analysis/cracks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
      setAnalysisMode(res.mode || 'demo');
      showToast('Crack evaluation completed', 'success');
      fetchHistory();
    } catch (err) {
      showToast('Analysis error: ' + err.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <SearchCode className="w-6 h-6 text-accent-cyan" />
              Crack Detection & Structural Observation
            </h1>
            <DemoModeBadge mode={analysisMode} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forensic optical analysis of masonry, concrete columns, shear walls, and structural slabs.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
          >
            <Printer className="w-4 h-4 text-accent-cyan" />
            Print Forensic Report
          </button>
        )}
      </div>

      {/* Mandatory Engineering Disclaimer */}
      <DisclaimerBanner
        type="danger"
        title="Forensic Engineering Calibrated Scale Notice"
        text="NON-STRUCTURAL VISUAL ESTIMATE ONLY: Ordinary photographic analysis cannot determine subsurface integrity, depth, or calibrated crack width. A licensed structural or civil engineer must inspect cracks showing diagonal shear patterns, active settlement, or displacement before any load-bearing decisions are made. Do not claim numerical crack widths or building life expectations without physical optical tell-tale gages."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent-cyan" />
              1. Concrete / Masonry Image
            </h3>

            <div className="relative aspect-video rounded-xl bg-navy-900 border border-slate-700/80 overflow-hidden mb-4 group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Crack Inspection Preview"
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

            <label className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-navy-900 border border-dashed border-slate-700 text-slate-300 hover:border-accent-cyan hover:text-white transition mb-4">
              <Upload className="w-4 h-4 text-accent-cyan" />
              <span>Upload Surface Photograph</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Or select high-detail forensic sample:</span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_CRACK_IMAGES.map((sample) => (
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
                      {sample.structureType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Structure Parameters Form */}
          <div className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl text-xs space-y-4">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              2. Structure & Location Parameters
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Structure Type *</label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              >
                {STRUCTURE_TYPES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Inspection Notes & Grid Coordinates</label>
              <input
                type="text"
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
                placeholder="e.g. Basement Sub-grade Level 4, Gridline C-4"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="mt-4 w-full py-3 rounded-xl font-bold text-xs text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating Fracture Propagation...</span>
                </>
              ) : (
                <>
                  <SearchCode className="w-4 h-4" />
                  <span>Execute AI Crack Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Analysis Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult && !isAnalyzing && (
            <div className="bg-navy-800/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 rounded-2xl bg-navy-800 text-accent-cyan mb-4 border border-slate-700">
                <SearchCode className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Structural Evaluation Ready</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
                Upload a photograph of structural concrete or select a sample to identify shear fractures, hairline shrinkage crazing, and settlement symptoms.
              </p>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-[11px] text-slate-400 max-w-sm">
                Note: Photogrammetric crack width measurements require physical millimeter reference targets.
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] animate-pulse">
              <Sparkles className="w-12 h-12 text-accent-cyan animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-100 mb-2">Analyzing Crack Geometry...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Differentiating between cosmetic drying shrinkage and structural load-induced shear vectors.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 rounded-2xl bg-navy-800 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Structure:</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-accent-cyan border border-cyan-500/20">
                      {analysisResult.structure_type}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Severity:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded border uppercase bg-amber-500/10 text-amber-300 border-amber-500/30">
                      {analysisResult.overall_severity}
                    </span>
                  </div>
                  <DemoModeBadge mode={analysisMode} />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Observations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Visual Crack Observations ({analysisResult.observations?.length || 0})
                </h3>

                {analysisResult.observations?.map((obs, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-navy-800 border border-slate-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-accent-orange uppercase tracking-wider block mb-0.5">
                          {obs.crack_type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100">{obs.location_in_image}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-slate-900 border-slate-700 text-slate-300">
                        Confidence: {Math.round(obs.confidence * 100)}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 bg-navy-900/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="font-semibold text-slate-400 block mb-0.5">Visual Characterization:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{obs.appearance}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs">
                      <span className="font-semibold text-accent-cyan block mb-1">Recommended Forensic Action:</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{obs.recommended_action}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Limitations Notice */}
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-accent-cyan" />
                  Engineering Limitations & Measurement Disclaimers
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  {analysisResult.limitations?.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                  <li>Photographic analysis cannot detect internal rebar corrosion or concrete carbonation depth.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Crack Table */}
      <div className="mt-12 bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Structural Observation History</span>
          <span className="text-xs text-slate-400 font-normal">{history.length} records saved</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Structure Type</th>
                <th className="p-3">Location Notes</th>
                <th className="p-3">Summary</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No crack observations logged yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-700/30 transition">
                    <td className="p-3 font-mono text-accent-cyan">#CRK-{h.id}</td>
                    <td className="p-3 font-semibold text-slate-200">{h.structure_type}</td>
                    <td className="p-3 text-slate-400">{h.location_notes || 'N/A'}</td>
                    <td className="p-3 max-w-xs truncate text-slate-300">{h.summary}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-slate-900 border-slate-700 text-amber-300">
                        {h.severity}
                      </span>
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

export default CrackAnalysisPage;
