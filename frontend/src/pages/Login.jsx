import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Building2, Truck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = (err, fallbackText) => {
    if (!err.response) {
      return 'Unable to reach backend server. Please verify FastAPI backend is running on http://127.0.0.1:8000.';
    }
    if (err.response.status >= 500) {
      return 'Backend connection error (Status 500). Please ensure the FastAPI backend is running on port 8000.';
    }
    if (err.response.status === 401) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (typeof err.response?.data?.detail === 'string') {
      return err.response.data.detail;
    }
    return fallbackText || 'An error occurred during authentication.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 'Admin') navigate('/admin');
    else if (role === 'Recycling Center') navigate('/center');
    else if (role === 'Collection Staff') navigate('/staff');
    else navigate('/dashboard');
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(demoEmail, demoPass);
      redirectUser(user.role);
    } catch (err) {
      setError('Demo login failed: ' + getErrorMessage(err, err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* 60% Dominant: Crisp Light Canvas with subtle eco geometric glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-600/25 mb-2">
            <Recycle className="w-8 h-8 text-white" />
          </div>
          {/* 10% Black Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to manage e-waste pickups and recycling workflows
          </p>
        </div>

        {/* 60% White Card Surface */}
        <div className="bg-white p-6 sm:p-8 space-y-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-2xl">
          {error && (
            <div className="p-3.5 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@ewaste.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* 10% High-Contrast Jet Black Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-xl shadow-lg shadow-slate-900/10 transition flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* 30% Eco-Color Accented 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('user@ewaste.com', 'user123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 flex items-center gap-2 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] text-slate-900">Citizen User</p>
                  <p className="text-[10px] text-slate-500">user@ewaste.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@ewaste.com', 'admin123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-slate-800 hover:text-amber-900 flex items-center gap-2 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] text-slate-900">System Admin</p>
                  <p className="text-[10px] text-slate-500">admin@ewaste.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('center@ewaste.com', 'center123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 text-slate-800 hover:text-teal-900 flex items-center gap-2 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] text-slate-900">Recycling Center</p>
                  <p className="text-[10px] text-slate-500">center@ewaste.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('staff@ewaste.com', 'staff123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-900 flex items-center gap-2 transition text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] text-slate-900">Collection Staff</p>
                  <p className="text-[10px] text-slate-500">staff@ewaste.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
