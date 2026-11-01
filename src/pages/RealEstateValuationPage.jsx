import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Building,
  TrendingUp,
  Info,
  Printer,
  FileDown,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoModeBadge from '../components/common/DemoModeBadge';

const AMENITY_OPTIONS = [
  'Central HVAC',
  'Underground Parking',
  'Fire Sprinkler Grid',
  'High-Speed Elevators',
  'Emergency Generator',
  'LEED / BREEAM Certified',
  'Rooftop Solar Array',
  'Loading Docks'
];

export const RealEstateValuationPage = () => {
  const { selectedProject } = useProject();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    property_type: 'Commercial Complex',
    location: 'Hudson Yards, New York, NY',
    land_area: 12000,
    builtup_area: 45000,
    floors: 6,
    rooms: 24,
    age: 2,
    quality: 'Premium',
    condition: 'Excellent',
    amenities: ['Central HVAC', 'Underground Parking', 'High-Speed Elevators', 'Fire Sprinkler Grid'],
    local_market_rate: ''
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('demo');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/valuation');
      setHistory(res.data || []);
    } catch (err) {
      console.warn('Failed to load valuation history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (item) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter((a) => a !== item)
        : [...prev.amenities, item]
    }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setResult(null);

    const payload = {
      project_id: selectedProject?.id || null,
      property_type: formData.property_type,
      location: formData.location,
      land_area: Number(formData.land_area) || 0,
      builtup_area: Number(formData.builtup_area) || 0,
      floors: Number(formData.floors) || 1,
      rooms: Number(formData.rooms) || 1,
      age: Number(formData.age) || 0,
      quality: formData.quality,
      condition: formData.condition,
      amenities: formData.amenities,
      local_market_rate: formData.local_market_rate ? Number(formData.local_market_rate) : null
    };

    try {
      const res = await api.post('/valuation', payload);
      setResult(res.data);
      setMode(res.mode || 'demo');
      showToast('Property valuation calculated!', 'success');
      fetchHistory();
    } catch (err) {
      showToast('Valuation error: ' + err.message, 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-accent-cyan" />
              Real Estate Valuation Engine
            </h1>
            <DemoModeBadge mode={mode} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic replacement cost & architectural quality assessment for commercial & residential assets.
          </p>
        </div>

        {result && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-navy-800 border border-slate-700 hover:bg-navy-700 transition"
          >
            <Printer className="w-4 h-4 text-accent-cyan" />
            Print Valuation Summary
          </button>
        )}
      </div>

      {/* Valuation Disclaimer */}
      <DisclaimerBanner
        type="warning"
        title="Appraisal & Market Data Disclosure"
        text="ILLUSTRATIVE ESTIMATION ONLY: This property valuation model uses an algorithmic replacement-cost and architectural quality index methodology. It does NOT constitute a certified appraisal or RICS/MAI valuation. Actual transaction value depends on localized deed transfers, title encumbrances, soil bearing capacity, and prevailing commercial cap rates. A licensed real estate appraiser must perform an on-site inspection for financing."
      />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCalculate} className="bg-navy-800 border border-slate-800/90 rounded-2xl p-5 shadow-xl text-xs space-y-4">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-accent-cyan" />
              Asset Parameters
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              >
                <option value="Commercial Complex">Commercial Complex</option>
                <option value="Residential Multi-Family">Residential Multi-Family</option>
                <option value="Single-Family Home">Single-Family Home</option>
                <option value="Industrial Warehouse">Industrial Warehouse</option>
                <option value="Infrastructure / Institutional">Infrastructure / Institutional</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Site / Metro Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Hudson Yards, New York, NY"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Land Area (sq.ft)</label>
                <input
                  type="number"
                  name="land_area"
                  value={formData.land_area}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Built-Up Area (sq.ft)</label>
                <input
                  type="number"
                  name="builtup_area"
                  value={formData.builtup_area}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Floors</label>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Units / Rooms</label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Build Quality</label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                >
                  <option value="Economy">Economy</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
                >
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Optional Local Benchmark Rate ($/sq.ft)
              </label>
              <input
                type="number"
                name="local_market_rate"
                value={formData.local_market_rate}
                onChange={handleInputChange}
                placeholder="Leave blank for regional parametric baseline"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Architectural Amenities</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AMENITY_OPTIONS.map((item) => {
                  const checked = formData.amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`text-left p-2 rounded-lg text-[11px] border flex items-center justify-between transition ${
                        checked
                          ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan'
                          : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      <span className="font-bold">{checked ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="mt-4 w-full py-3 rounded-xl font-bold text-xs text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Calculating Replacement Valuation...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Generate Property Valuation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isCalculating && (
            <div className="bg-navy-800/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 rounded-2xl bg-navy-800 text-accent-cyan mb-4 border border-slate-700">
                <Calculator className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Awaiting Valuation Parameters</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
                Fill in the square footage, building specifications, and amenity packages on the left to compute estimated replacement valuations and unit rates.
              </p>
            </div>
          )}

          {isCalculating && (
            <div className="bg-navy-800 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] animate-pulse">
              <Sparkles className="w-12 h-12 text-accent-cyan animate-spin mb-4" />
              <h3 className="text-base font-bold text-slate-100 mb-2">Simulating Replacement Economics...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Factoring age depreciation curve, structural grade multiplier, and MEP specifications.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* Main Estimation Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Estimated Replacement Value Range
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Confidence: {result.confidence}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 pb-4 border-b border-slate-800">
                  <div className="text-3xl lg:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                    ${(result.estimated_avg).toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-accent-cyan font-mono">
                    ${result.price_per_sq_unit.toFixed(2)} / {result.unit}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Conservative Low (-12%)</span>
                    <span className="font-bold text-slate-200 font-mono">${result.estimated_min.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Upper Market Bound (+12%)</span>
                    <span className="font-bold text-slate-200 font-mono">${result.estimated_max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Factors Breakdown */}
              <div className="bg-navy-800 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pricing Drivers & Valuation Adjustments
                </h3>
                <div className="space-y-2.5">
                  {result.factors.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{f.name}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{f.description}</p>
                      </div>
                      <span className={`text-xs font-mono font-bold shrink-0 ${
                        f.impact_percentage > 0
                          ? 'text-emerald-400'
                          : f.impact_percentage < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}>
                        {f.impact_percentage > 0 ? `+${f.impact_percentage}%` : f.impact_percentage < 0 ? `${f.impact_percentage}%` : 'Base'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                    Underlying Assumptions
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    {result.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-navy-800 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                    Suggested Additional Audits
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    {result.suggested_additional_information.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Valuations */}
      <div className="mt-12 bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Saved Property Valuations</span>
          <span className="text-xs text-slate-400 font-normal">{history.length} records saved</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Property Type</th>
                <th className="p-3">Location</th>
                <th className="p-3">Built-up Area</th>
                <th className="p-3">Estimated Value</th>
                <th className="p-3">Rate / sq.ft</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No valuations generated yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-700/30 transition">
                    <td className="p-3 font-mono text-accent-cyan">#VAL-{h.id}</td>
                    <td className="p-3 font-semibold text-slate-200">{h.property_type}</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">{h.location}</td>
                    <td className="p-3 font-mono">{h.builtup_area.toLocaleString()} sq.ft</td>
                    <td className="p-3 font-mono font-bold text-slate-100">${h.estimated_avg.toLocaleString()}</td>
                    <td className="p-3 font-mono text-accent-cyan">${h.price_per_sq_unit.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{new Date(h.created_at).toLocaleDateString()}</td>
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

export default RealEstateValuationPage;
