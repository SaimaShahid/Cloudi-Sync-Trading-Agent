import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { formatApiError } from '@/lib/apiClient';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Link to="/">
              <Logo size="lg" showText={false} />
            </Link>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-on-surface font-headline">Create Your Account</h2>
          <p className="text-xs text-on-surface-variant">Start paper trading with Cloudi Sync in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

          <div>
            <label className="text-on-surface-variant block mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-9 pr-3 py-2.5 text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-on-surface-variant block mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-9 pr-3 py-2.5 text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-on-surface-variant block mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-9 pr-3 py-2.5 text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-60 text-on-primary rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-colors"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>

          <div className="text-center pt-2 text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
