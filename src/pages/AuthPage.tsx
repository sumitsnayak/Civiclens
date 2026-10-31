import React, { useState } from 'react';
import { useAuth } from '../lib/authStore';
import { Eye, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInAsDemoUser, isSupabaseConnected } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email || !password) {
      setError('Please fill in all required credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const res = await signUpWithEmail(email, password, displayName);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setInfoMessage('Account created successfully! Welcome to CivicLens.');
        setTimeout(onSuccess, 1000);
      }
    } else {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        onSuccess();
      }
    }
  };

  const handleDemoLogin = (role: 'citizen' | 'admin') => {
    signInAsDemoUser(role);
    onSuccess();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-midnight-950 text-electric-400 mx-auto flex items-center justify-center shadow-glow-teal">
          <Eye size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {isSignUp ? 'Create CivicLens Account' : 'Sign in to CivicLens'}
        </h1>
        <p className="text-xs text-slate-500">
          {isSignUp
            ? 'Join your community to report and track municipal improvements'
            : 'Access your personal civic report dashboard'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name / Alias
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
                />
                <User size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
              <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
              />
              <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-slate-500 hover:text-electric-600 transition-colors font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account yet? Sign up"}
          </button>
        </div>

        {/* Demo Roles Quick Login */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Hackathon One-Click Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('citizen')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-electric-500 bg-slate-50 dark:bg-slate-800 hover:bg-electric-500/10 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <User size={13} className="text-electric-500" />
              <span>Citizen Demo</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl border border-amber-300/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck size={13} className="text-amber-500" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
