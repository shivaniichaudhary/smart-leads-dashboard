import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';
import { LogIn, UserPlus, Shield, Mail, Lock, User } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (token: string, user: { name: string; email: string; role: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  // Toggle state between Login view and Register view
  const [isLogin, setIsLogin] = useState<boolean>(true);
  
  // Form input field tracks
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('Sales User'); // Defaults to Assignment standard
  
  // Error and UI loading state handlers
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password, role };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      
      if (response.data.success) {
        const { token, name: userName, email: userEmail, role: userRole } = response.data.data;
        // Bubble data back up to save globally in App level storage
        onAuthSuccess(token, { name: userName, email: userEmail, role: userRole });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Visual Brand Top Frame */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Assignment Account'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? 'Sign in to manage your pipeline metrics' : 'Register a fresh database profile'}
          </p>
        </div>

        {/* Error Notification Toast Wrapper */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium flex items-start gap-2 animate-shake">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Core Input Form Framework */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Field (Rendered exclusively during registration actions) */}
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold tracking-wider uppercase mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Email Address Input */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold tracking-wider uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@university.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Security Input */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold tracking-wider uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Role Check Selection Box (Rendered exclusively during registration actions) */}
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold tracking-wider uppercase mb-2">Access Role Level</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all duration-200 cursor-pointer"
              >
                <option value="Sales User">Sales User (Standard view + editing privileges)</option>
                <option value="Admin">Admin (Full override control + delete metrics capability)</option>
              </select>
            </div>
          )}

          {/* Submission Action Execution Trigger Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 transform active:scale-[0.98] mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to System</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Compile Profile Account</span>
              </>
            )}
          </button>
        </form>

        {/* Structural Interactive View Toggle Segment Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-150 inline-flex items-center gap-1 focus:outline-none"
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in here"}
          </button>
        </div>

      </div>
    </div>
  );
};