
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import api from '../../services/api';

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const dateFormat = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await api.get('/orders/admin/stats');

        if (cancelled) return;

        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
        setError('');
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            'Unable to load dashboard data.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
        {
          label: 'Total Products',
          value: stats.totalProducts,
          description: 'Products in the database',
        },
        {
          label: 'Customers',
          value: stats.totalUsers,
          description: 'Registered customer accounts',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders,
          description: 'Orders placed by customers',
        },
        {
          label: 'Order Value',
          value: currency(stats.totalSales),
          description: 'Excluding cancelled orders',
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#FF7043]">Overview</p>
          <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Welcome to your Fit Forge admin panel.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="rounded-lg bg-[#FF5722] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF7043]"
        >
          Manage Orders
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-8 text-[#A3A3A3]">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900 bg-[#1A1A1A] p-6">
          <p className="font-medium text-red-400">{error}</p>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Check that the backend is running and your account has
            the admin role.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-5"
              >
                <p className="text-sm text-[#A3A3A3]">
                  {card.label}
                </p>
                <p className="mt-3 break-words text-2xl font-bold">
                  {card.value}
                </p>
                <p className="mt-2 text-xs text-[#A3A3A3]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-[#333333] bg-[#1A1A1A]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333333] p-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-[#A3A3A3]">
                  The five most recently placed orders.
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="text-sm font-medium text-[#FF7043] hover:text-[#FF5722]"
              >
                View all orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-[#A3A3A3]">
                No orders have been placed yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[#222222] text-[#A3A3A3]">
                    <tr>
                      <th className="px-5 py-4 font-medium">Order</th>
                      <th className="px-5 py-4 font-medium">Customer</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Total</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-[#333333]"
                      >
                        <td className="px-5 py-4 font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4">
                          <p>{order.customer?.name || 'Unknown'}</p>
                          <p className="mt-1 text-xs text-[#A3A3A3]">
                            {order.customer?.email || ''}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#A3A3A3]">
                          {dateFormat(order.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          {currency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          {order.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
