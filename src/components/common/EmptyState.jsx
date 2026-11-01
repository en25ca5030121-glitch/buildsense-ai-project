import React from 'react';
import { FolderPlus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderPlus,
  title = "No records found",
  description = "Get started by adding your first record.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-navy-800/40 border border-dashed border-slate-800 rounded-2xl">
      <div className="p-4 rounded-2xl bg-navy-700/50 text-accent-cyan mb-4 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
