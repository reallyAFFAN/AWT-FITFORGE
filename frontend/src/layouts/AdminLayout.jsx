
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-[#FF5722] text-white'
      : 'text-[#A3A3A3] hover:bg-[#2D2D2D] hover:text-white'
  }`;

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] md:flex">
      <aside className="w-full border-b border-[#333333] bg-[#1A1A1A] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            FIT <span className="text-[#FF5722]">FORGE</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-[#A3A3A3]">
            Admin Panel
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            Order Management
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink
            to="/home"
            className="rounded-lg px-4 py-3 text-sm text-[#A3A3A3] hover:bg-[#2D2D2D] hover:text-white"
          >
            Back to Store
          </NavLink>
        </nav>

        <div className="mt-8 border-t border-[#333333] pt-5">
          <p className="truncate text-sm font-medium">
            {user?.name || 'Administrator'}
          </p>
          <p className="mt-1 text-xs text-[#A3A3A3]">
            Administrator
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-[#444444] px-4 py-2 text-sm text-[#F5F5F5] transition hover:border-[#FF5722] hover:text-[#FF7043]"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
