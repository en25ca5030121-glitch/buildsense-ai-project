import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StatCard = ({
  title,
  value,
  subtext,
  trend,
  status = 'neutral',
  icon: Icon,
  linkTo,
  accentColor = 'cyan'
}) => {
  const navigate = useNavigate();

  const getBorderColor = () => {
    if (status === 'warning') return 'hover:border-amber-500/50';
    if (status === 'success') return 'hover:border-emerald-500/50';
    if (status === 'error') return 'hover:border-rose-500/50';
    return 'hover:border-accent-cyan/50';
  };

  const getIconColor = () => {
    if (accentColor === 'orange') return 'text-accent-orange bg-orange-500/10 border-orange-500/20';
    if (status === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (status === 'success') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'error') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-accent-cyan bg-cyan-500/10 border-cyan-500/20';
  };

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className={`group bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20 transition-all duration-300 ${getBorderColor()} ${
        linkTo ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${getIconColor()} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">{value}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{subtext}</span>
        {trend && (
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}
          </span>
        )}
      </div>

      {linkTo && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-accent-cyan opacity-80 group-hover:opacity-100 transition">
          <span>View module</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
