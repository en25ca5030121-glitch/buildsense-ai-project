import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back to BuildSense AI!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setIsSubmitting(true);
    try {
      await demoLogin(role);
      showToast(`Logged in as ${role} (Demo Mode)`, 'success');
      navigate('/');
    } catch (err) {
      showToast('Demo login error: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-950/50">
            <HardHat className="w-8 h-8 text-navy-950" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            BuildSense <span className="text-accent-orange">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Multimodal Construction Intelligence & Site Audit Platform
          </p>
        </div>

        {/* 1-Click Demo Login Selection */}
        <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent-cyan" />
              1-Click Demo Access
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-accent-cyan border border-cyan-500/20 font-bold">
              Instant
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Select an industrial role below to launch the dashboard with realistic pre-configured site data:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Administrator', label: 'VP / Admin' },
              { role: 'Project Manager', label: 'Project Manager' },
              { role: 'Site Engineer', label: 'Civil Engineer' },
              { role: 'Safety Officer', label: 'Safety Officer' }
            ].map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoLogin(role)}
                disabled={isSubmitting}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 hover:border-accent-cyan transition text-center truncate cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="text-center pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Or sign in with registered credentials</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@buildsense.ai"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-navy-950 bg-accent-cyan hover:bg-cyan-300 transition shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-accent-cyan hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
