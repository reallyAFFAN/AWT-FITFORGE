import { Link, Outlet } from 'react-router';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#121212] px-4 py-8 text-[#F5F5F5]">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">

          {/* Fit Forge Branding */}
          <div className="mb-8 text-center">
            <Link
              to="/home"
              className="inline-block"
            >
              <h1 className="text-4xl font-black uppercase tracking-tight text-[#F5F5F5] transition hover:text-[#FF5722]">
                Fit Forge
              </h1>
            </Link>

            <p className="mt-2 text-sm tracking-wide text-[#A3A3A3]">
              Built for your style. Built for your performance.
            </p>
          </div>

          {/* Authentication Card */}
          <div className="rounded-2xl border border-[#333333] bg-[#1F1F1F] p-6 shadow-2xl sm:p-8">
            <Outlet />
          </div>

          {/* Continue Shopping */}
          <div className="mt-6 text-center">
            <Link
              to="/home"
              className="text-sm font-medium text-[#A3A3A3] transition hover:text-[#FF5722]"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-[#666666]">
            © 2026 Fit Forge. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}

export default AuthLayout;