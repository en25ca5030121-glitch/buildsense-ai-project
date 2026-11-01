import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Tag,
  CheckCircle2,
  FileCheck2,
  Layers,
  Scale,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const KNOWLEDGE_ITEMS = [
  {
    id: 'term-1',
    category: 'Terminology',
    title: 'Critical Path Method (CPM) & Total Float',
    summary: 'Sequence of project activities determining the shortest possible duration to complete the project.',
    details:
      'Total Float (TF) is the total amount of time an activity can be delayed without delaying the project completion date. Free Float (FF) is the amount of time an activity can be delayed without delaying the early start of any immediate successor activity. Zero float activities reside directly on the critical path.'
  },
  {
    id: 'term-2',
    category: 'Terminology',
    title: 'Concrete Slump Test (ASTM C143)',
    summary: 'Standardized field test to determine consistency and workability of freshly mixed concrete.',
    details:
      'A truncated cone (12 inches high, 8-inch base, 4-inch top) is filled in 3 equal volume layers, each rodded 25 times with a 5/8-inch tamping rod. The cone is vertically inverted and lifted, and the subsidence (slump) is measured to the nearest 1/4 inch. Typical structural pumping slumps range from 4 to 6 inches, or 7 to 9 inches with superplasticizers.'
  },
  {
    id: 'mat-1',
    category: 'Material Guides',
    title: 'Concrete Compressive Strength Grades (ASTM C39 / Eurocode)',
    summary: 'Mechanical compressive strength thresholds at 28 days for structural elements.',
    details:
      '- C20/25 (3,000 PSI): Non-structural unreinforced footings and blinding layers.\n- C30/37 (4,500 PSI): Standard suspended slabs, beams, and residential structural columns.\n- C50/60 (7,500 PSI): High-rise commercial columns, transfer girders, and post-tensioned parking decks.\n- C70/85 (10,000+ PSI): Ultra-high-performance concrete (UHPC) for seismic mega-columns.'
  },
  {
    id: 'mat-2',
    category: 'Material Guides',
    title: 'Deformed Steel Reinforcing Bars (ASTM A615 / A706)',
    summary: 'Tensile rebar classifications, bending tolerances, and weldability specifications.',
    details:
      'Grade 60 (minimum yield strength 60,000 PSI / 420 MPa) is the global benchmark for building construction. For seismic design categories D, E, and F, ASTM A706 weldable low-alloy rebar is mandatory because it provides controlled tensile-to-yield strength ratios (min 1.25) to prevent brittle rupture during lateral drift.'
  },
  {
    id: 'safe-1',
    category: 'Safety Checklists',
    title: 'OSHA Subpart L: Supported Scaffolding Pre-Shift Checklist',
    summary: 'Mandatory daily visual inspection protocol prior to trade occupancy.',
    details:
      '1. Sound footing: Base plates and mudsills installed on level ground; never supported by cinder blocks.\n2. Planking: Structural grade scaffold planks with no more than 1-inch gaps and minimum 6-inch overhang.\n3. Fall Protection: Guardrails installed at 42 inches (±3 inches) with intermediate mid-rails and 4-inch toeboards on all open sides > 10 feet.\n4. Access: Integral scaffold stair towers or secured ladders extending 3 feet past platform landing.'
  },
  {
    id: 'safe-2',
    category: 'Safety Checklists',
    title: 'Excavation & Trench Safety (OSHA 1926 Subpart P)',
    summary: 'Daily requirements for excavations exceeding 5 feet in depth.',
    details:
      '1. Competent Person daily soil classification (Type A, B, or C using penetrometer or ribbon test).\n2. Protective systems: Sloping/benching (1.5H:1V for Type C), aluminum hydraulic shoring, or trench boxes.\n3. Egress: Ladders, stairways, or ramps located within 25 lateral feet of all trench workers.\n4. Spoil pile: Stored minimum 2 feet back from the trench lip to prevent collapse.'
  },
  {
    id: 'qc-1',
    category: 'Quality Control',
    title: 'Pre-Pour Concrete Placement Inspection Hold-Point',
    summary: 'Quality verification steps required before batch dispatch approval.',
    details:
      '- Formwork: Cleaned with compressed air; release agent applied without puddling; form ties tightened.\n- Rebar: Clear cover verified using concrete bar chairs (min 2 inches for soil contact, 1.5 inches for columns).\n- Embeds: Sleeves, MEP conduits, and hold-down anchor bolts surveyed for position and elevation.\n- Subgrade: Moisten dry gravel/dirt subbase to prevent moisture suction from the fresh concrete.'
  },
  {
    id: 'calc-1',
    category: 'Estimation Formulas',
    title: 'Essential Civil Estimation Reference Formulas',
    summary: 'Field calculation formulas for concrete volume, rebar weight, and formwork area.',
    details:
      '1. Concrete Volume: Volume (cu.yds) = Length (ft) × Width (ft) × Depth (ft) / 27. (Add 5% waste factor for slabs; 10% for auger cast piles).\n2. Rebar Unit Weight: Weight (kg/m) = D² / 162 (where D is bar diameter in millimeters).\n3. Retaining Wall Earth Pressure (Rankine): Ka = (1 - sin φ) / (1 + sin φ).'
  }
];

export const KnowledgeCenterPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(['term-1', 'qc-1']);
  const [selectedItem, setSelectedItem] = useState(KNOWLEDGE_ITEMS[0]);

  const categories = ['All', 'Terminology', 'Material Guides', 'Safety Checklists', 'Quality Control', 'Estimation Formulas', 'Bookmarked'];

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const filteredItems = KNOWLEDGE_ITEMS.filter((item) => {
    if (activeCategory === 'Bookmarked' && !bookmarkedIds.includes(item.id)) return false;
    if (activeCategory !== 'All' && activeCategory !== 'Bookmarked' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-accent-cyan" />
          Construction Knowledge Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Peer-verified engineering references: OSHA standards, concrete grades, QA/QC hold-point checklists, and field formulas.
        </p>
      </div>

      <DisclaimerBanner
        type="warning"
        title="Regulatory Compliance Disclosure"
        text="Verified civil reference specifications. While aligned with standard OSHA, ACI, and ASTM frameworks, local municipal building codes, project specifications, and licensed structural engineer directives always take precedence."
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl bg-navy-800 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search checklists, concrete grades, formulas..."
            className="w-full bg-navy-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-accent-cyan text-navy-950 shadow-md shadow-cyan-950/40'
                  : 'bg-navy-900 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-navy-800/40 rounded-2xl border border-dashed border-slate-800 text-xs">
              No matching knowledge articles found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isBookmarked = bookmarkedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                    isSelected
                      ? 'bg-navy-800 border-accent-cyan/80 ring-1 ring-accent-cyan/30'
                      : 'bg-navy-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(item.id, e)}
                      className="text-slate-500 hover:text-accent-orange transition"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-accent-orange" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.summary}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="bg-navy-800 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider block mb-1">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-100">{selectedItem.title}</h2>
                </div>
                <button
                  onClick={(e) => toggleBookmark(selectedItem.id, e)}
                  className="p-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-300 hover:text-accent-orange transition"
                >
                  {bookmarkedIds.includes(selectedItem.id) ? (
                    <BookmarkCheck className="w-5 h-5 text-accent-orange" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Executive Brief
                </span>
                <p className="text-xs text-slate-200 leading-relaxed p-3.5 rounded-xl bg-navy-900/60 border border-slate-800">
                  {selectedItem.summary}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Technical Specifications & Field Guidance
                </span>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-navy-900/40 p-4 rounded-xl border border-slate-800/80">
                  {selectedItem.details}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Verified Reference Grade: ACI / OSHA / ASTM</span>
                <span className="font-mono text-slate-500">Document #{selectedItem.id}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-navy-800/40 rounded-2xl border border-dashed border-slate-800 text-xs">
              Select an article on the left to read full technical specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenterPage;
