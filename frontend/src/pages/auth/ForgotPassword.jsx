import { useState } from 'react';
import { Link } from 'react-router';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      setSuccessMessage(
        'If an account exists with this email, password reset instructions will be sent.'
      );
    }, 1000);
  };

  const emailIsFloating =
    focusedField === 'email' || email.length > 0;

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#F5F5F5]">
          Forgot your password?
        </h2>

        <p className="mt-2 text-sm text-[#A3A3A3]">
          Enter your email and we'll help you reset your password.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        {/* Email */}
        <div>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              autoComplete="email"
              placeholder=" "
              className={`h-14 w-full rounded-lg border bg-[#121212] px-4 text-[#F5F5F5] outline-none transition ${
                error
                  ? 'border-[#E63946]'
                  : focusedField === 'email'
                    ? 'border-[#555555]'
                    : 'border-[#333333]'
              }`}
            />

            <label
              htmlFor="email"
              className={`pointer-events-none absolute left-4 transition-all duration-200 ${
                emailIsFloating
                  ? 'top-0 -translate-y-1/2 bg-[#1F1F1F] px-1 text-xs text-[#FF5722]'
                  : 'top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3]'
              }`}
            >
              Email
            </label>
          </div>

          {error && (
            <p className="mt-2 text-sm text-[#E63946]">
              {error}
            </p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#22C55E]">
            {successMessage}
          </div>
        )}

        {/* Reset Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FF5722] px-4 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center text-sm text-[#A3A3A3]">
        Remember your password?{' '}

        <Link
          to="/login"
          className="font-semibold text-[#FF5722] transition hover:text-[#FF7043]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;