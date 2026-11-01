import React from 'react';

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-navy-800 border border-slate-800/80 rounded-xl p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-700/60 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-slate-700/60 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-700/80 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-700/40 rounded w-2/3"></div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 4, cols = 5 }) => {
  return (
    <div className="w-full bg-navy-800 border border-slate-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-navy-900 border-b border-slate-800/80"></div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-slate-700/50 rounded flex-1"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="w-full h-72 bg-navy-800 border border-slate-800 rounded-xl p-5 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-slate-700/70 rounded w-1/4"></div>
        <div className="h-4 bg-slate-700/40 rounded w-1/6"></div>
      </div>
      <div className="flex items-end gap-3 h-48 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-700/40 rounded-t"
            style={{ height: `${30 + (i % 5) * 15}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};
