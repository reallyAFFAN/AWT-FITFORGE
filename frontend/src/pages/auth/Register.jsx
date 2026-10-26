
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useAuth } from '../../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await register(name, email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate('/home', { replace: true });
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
          Create an account
        </h2>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          Join Fit Forge and start shopping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
            className={getInputClass('name')}
            autoComplete="name"
          />
          <label htmlFor="name" className={getLabelClass('name')}>
            Full name
          </label>
        </div>

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
            className={`${getInputClass('password')} pr-12`}
            autoComplete="new-password"
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

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField('')}
            className={`${getInputClass('confirmPassword')} pr-12`}
            autoComplete="new-password"
          />
          <label
            htmlFor="confirmPassword"
            className={getLabelClass('confirmPassword')}
          >
            Confirm password
          </label>
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((current) => !current)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#A3A3A3] transition hover:text-[#F5F5F5]"
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-[#E63946]/30 bg-[#E63946]/10 px-4 py-3 text-sm text-[#E63946]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FF5722] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#A3A3A3]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-[#FF5722] transition hover:text-[#FF7043]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;
