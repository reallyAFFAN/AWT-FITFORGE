import { Link } from 'react-router';

function Footer() {
  return (
    <footer className="border-t border-[#333333] bg-[#1A1A1A]">

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#F5F5F5]">
              Fit Forge
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-6 text-[#A3A3A3]">
              Built for your style. Built for your performance.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Shop
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <Link
                to="/products"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                All Products
              </Link>

              <Link
                to="/products"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Men's
              </Link>

              <Link
                to="/products"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Women's
              </Link>

              <Link
                to="/products"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Accessories
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Customer Service
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <a
                href="#contact"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Contact Us
              </a>

              <a
                href="#shipping"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Shipping
              </a>

              <a
                href="#returns"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Returns
              </a>

              <a
                href="#faq"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Account
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <Link
                to="/login"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Create Account
              </Link>

              <Link
                to="/orders"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                My Orders
              </Link>

              <Link
                to="/profile"
                className="block text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                Profile
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[#333333] pt-6 text-center">
          <p className="text-xs text-[#666666]">
            © 2026 Fit Forge. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;