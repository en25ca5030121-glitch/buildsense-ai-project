import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner = ({ text, title = "Professional Advisory Notice", type = "warning" }) => {
  const isDanger = type === "danger";

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
      isDanger 
        ? "bg-rose-950/20 border-rose-500/30 text-rose-200" 
        : "bg-amber-950/20 border-amber-500/30 text-amber-200"
    }`}>
      {isDanger ? (
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-100 flex items-center gap-1.5">
          {title}
        </h4>
        <p className="text-xs leading-relaxed text-slate-300 font-normal">
          {text}
        </p>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
