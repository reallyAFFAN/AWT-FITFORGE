
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await api.get('/products');

        if (!cancelled) {
          setProducts(
            (response.data.products ?? []).map((product) => ({
              ...product,
              id: product._id || product.id,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load navbar search products:', error);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const getNavLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? 'text-[#FF5722]'
        : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
    }`;

  const query = searchQuery.trim().toLowerCase();

  const searchResults = query
    ? products.filter((product) =>
        [product.name, product.category, product.description]
          .some((value) => value?.toLowerCase().includes(query))
      )
    : [];

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchResults.length === 0) return;

    handleResultClick(searchResults[0].id);
  };

  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((current) => !current);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#333333] bg-[#121212]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/home"
          className="text-xl font-black uppercase tracking-tight text-[#F5F5F5] transition hover:text-[#FF5722]"
        >
          Fit Forge
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/home" className={getNavLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={getNavLinkClass}>
            Shop
          </NavLink>

          <a
            href="/home#categories"
            className="text-[#A3A3A3] transition hover:text-[#F5F5F5]"
          >
            Categories
          </a>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <button
            type="button"
            onClick={handleSearchToggle}
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
            className="text-[#A3A3A3] transition hover:text-[#F5F5F5]"
          >
            {isSearchOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 20l-4-4"
                />
              </svg>
            )}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative text-[#A3A3A3] transition hover:text-[#F5F5F5]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.4 12.2a2 2 0 001.96 1.6h8.88a2 2 0 001.95-1.55L22 7H6"
              />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5722] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Profile / Sign In */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              aria-label="Profile"
              title={user?.name || 'Profile'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5722] text-sm font-bold text-white transition hover:bg-[#FF7043]"
            >
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#F5F5F5] transition hover:border-[#FF5722] hover:text-[#FF5722]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-[#333333] bg-[#1A1A1A]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center overflow-hidden rounded-lg border border-[#333333] bg-[#121212] transition focus-within:border-[#FF5722]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-4 h-5 w-5 shrink-0 text-[#666666]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 20l-4-4"
                  />
                </svg>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full bg-transparent px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666]"
                />
              </div>

              {query && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#333333] bg-[#1F1F1F] shadow-2xl">
                  {searchResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleResultClick(product.id)}
                          className="flex w-full items-center gap-4 border-b border-[#333333] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#2D2D2D]"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 rounded-md object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#F5F5F5]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[#A3A3A3]">
                              {product.category}
                            </p>
                          </div>

                          <p className="text-sm font-bold text-[#F5F5F5]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-[#F5F5F5]">
                        No products found
                      </p>
                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        Try searching for something else.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
