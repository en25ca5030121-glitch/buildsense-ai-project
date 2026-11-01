import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const DemoModeBadge = ({ mode = 'demo', size = 'sm' }) => {
  const isDemo = mode === 'demo';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1'
      } ${
        isDemo
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      }`}
    >
      {isDemo ? (
        <>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Demo Simulation Mode</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live AI Analysis</span>
        </>
      )}
    </span>
  );
};

export default DemoModeBadge;
