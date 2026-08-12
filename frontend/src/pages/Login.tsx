import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const response = await apiClient.post('/v1/auth/register', {
          email,
          password,
          firstName,
          lastName,
        });
        const { token, user } = response.data.data;
        login(token, user);
      } else {
        const response = await apiClient.post('/v1/auth/login', {
          email,
          password,
        });
        const { token, user } = response.data.data;
        login(token, user);
      }
      navigate('/facilities');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
          {isRegister ? 'Create SportZone Account' : 'Sign in to SportZone'}
        </h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          {isRegister ? 'Register to book sports facilities' : 'Access your bookings and reserve courts'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="user@sportzone.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition shadow text-sm"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-emerald-600 hover:underline font-medium"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
