
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);

      const destination = location.state?.from || '/home';
      navigate(destination, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    return `peer w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition ${
      focusedField === fieldName
        ? 'border-[#FF5722]'
        : 'border-[#333333]'
    }`;
  };

  const getLabelClass = (fieldName) => {
    const isActive =
      focusedField === fieldName || Boolean(formData[fieldName]);

    return `pointer-events-none absolute left-4 transition-all ${
      isActive
        ? '-top-2 bg-[#1F1F1F] px-1 text-xs text-[#FF5722]'
        : 'top-3.5 text-sm text-[#A3A3A3]'
    }`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Sign in to your Fit Forge account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
            className={getInputClass('email')}
            autoComplete="email"
          />
          <label htmlFor="email" className={getLabelClass('email')}>
            Email address
          </label>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField('')}
            className={`${getInputClass('password')} pr-16`}
            autoComplete="current-password"
          />
          <label htmlFor="password" className={getLabelClass('password')}>
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#A3A3A3] transition hover:text-[#F5F5F5]"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-[#A3A3A3] transition hover:text-[#FF5722]"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-[#E63946]/30 bg-[#E63946]/10 px-4 py-3 text-sm text-[#E63946]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#22C55E]">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FF5722] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#A3A3A3]">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-[#FF5722] transition hover:text-[#FF7043]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
