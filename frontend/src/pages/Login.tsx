import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { Shield, User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [email, setEmail] = useState('user@sportzone.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setToken, setUser } = useApp();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'admin' | 'user') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@sportzone.com');
      setPassword('password123');
    } else {
      setEmail('user@sportzone.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/v1/auth/login', {
        email,
        password,
      });

      const data = response.data?.data;
      const jwtToken = data?.token || data?.accessToken;
      const userObj = data?.user;

      if (!jwtToken) {
        throw new Error('Invalid server response structure');
      }

      setToken(jwtToken);
      setUser({
        id: userObj?.id,
        email: userObj?.email,
        firstName: userObj?.firstName,
        lastName: userObj?.lastName,
        role: userObj?.role,
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 relative overflow-hidden font-['Outfit',sans-serif]">
      {/* Green ambient glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1db954]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#181818] rounded-3xl border border-[#282828] p-8 shadow-2xl relative z-10">
        {/* Logo Circle */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#1db954] flex items-center justify-center mb-3 shadow-xl shadow-[#1db954]/20 font-bold text-black text-xl tracking-wider">
            SZ
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">CourtCraft</h1>
          <p className="text-sm text-[#b3b3b3] mt-1">Sports Facility Booking Platform</p>
        </div>

        {/* Quick-Select Demo Role Buttons */}
        <div className="mb-6 p-1 bg-[#121212] rounded-full border border-[#282828] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect('user')}
            className={`py-2 px-4 rounded-full text-xs font-bold transition duration-200 flex items-center justify-center gap-2 ${
              selectedRole === 'user'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            User Demo
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`py-2 px-4 rounded-full text-xs font-bold transition duration-200 flex items-center justify-center gap-2 ${
              selectedRole === 'admin'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin Demo
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121212] border border-[#282828] text-white text-sm focus:outline-none focus:border-[#1db954]"
                placeholder="user@sportzone.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121212] border border-[#282828] text-white text-sm focus:outline-none focus:border-[#1db954]"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="spotify-pill w-full flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter the Complex</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#b3b3b3]">
          Demo login: <span className="text-white font-mono">{email}</span> / <span className="text-white font-mono">password123</span>
        </div>
      </div>
    </div>
  );
};
