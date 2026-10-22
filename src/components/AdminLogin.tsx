'use client';

import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const validUsernames = ['admin', 'admin@lumiere.com', 'lumiere', 'admin@luxe.com'];
      const validPasswords = ['admin123', 'admin', 'lumiere2026', 'luxe2026'];

      const trimmedUser = username.trim().toLowerCase();
      const trimmedPass = password.trim();

      if (validUsernames.includes(trimmedUser) && validPasswords.includes(trimmedPass)) {
        localStorage.setItem('lumiere_admin_auth', 'true');
        localStorage.setItem('lumiere_admin_user', username.trim());
        setLoading(false);
        onLoginSuccess();
      } else {
        setLoading(false);
        setError('Invalid username or password. Please check demo credentials below.');
      }
    }, 400);
  };

  const autofillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#E8DDD4] shadow-2xl relative overflow-hidden">
        {/* Shield Icon Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F3E5E8] text-[#D4708A] mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff Security Portal
          </div>
          <h2 className="text-2xl font-extrabold text-[#1A1412] uppercase tracking-tight">
            Admin & Staff Login
          </h2>
          <p className="text-xs text-[#5A4E49] mt-1">
            Enter authorized salon credentials to view bookings & operations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A4E49] mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-username"
                type="text"
                required
                autoFocus
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A4E49] mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A73] hover:text-[#1A1412]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-admin-login"
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-3.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
              loading || !username || !password
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#1A1412] hover:bg-[#2E2522] text-white cursor-pointer active:scale-98'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Admin Portal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-[#E8DDD4] text-center">
          <div className="bg-[#FAF6F2] rounded-2xl p-3.5 border border-[#E8DDD4] text-left flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4708A] block">
                Default Credentials
              </span>
              <p className="text-xs text-[#1A1412] font-mono mt-0.5">
                Username: <span className="font-bold">admin</span>
                <span className="mx-1.5 text-gray-400">|</span>
                Password: <span className="font-bold">admin123</span>
              </p>
            </div>
            <button
              type="button"
              onClick={autofillDemo}
              className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F3E5E8] hover:bg-[#ebd0d6] text-[#D4708A] cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 text-xs font-semibold text-[#8C7A73] hover:text-[#1A1412] transition-colors"
            >
              ← Return to Salon Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
