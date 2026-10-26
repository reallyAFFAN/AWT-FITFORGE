
import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

const STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const dateFormat = (date) =>
  date
    ? new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/orders/admin/all');
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load customer orders.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError('');
    setNotice('');

    try {
      const response = await api.patch(
        `/orders/admin/${orderId}/status`,
        { status }
      );

      const updatedOrder = response.data.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?.id === orderId
          ? updatedOrder
          : currentOrder
      );

      setNotice(
        `Order ${updatedOrder.orderNumber} updated to ${status}.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update order status.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleOrders =
    filter === 'All'
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm text-[#FF7043]">Store management</p>
        <h1 className="mt-1 text-3xl font-bold">Order Management</h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">
          View customer orders and update their delivery status.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#A3A3A3]">
            {orders.length} total order{orders.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-[#A3A3A3]" htmlFor="status-filter">
            Filter:
          </label>
          <select
            id="status-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-[#444444] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#FF5722]"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-lg border border-[#444444] px-4 py-2 text-sm transition hover:border-[#FF5722] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-5 rounded-lg border border-green-900 bg-[#142019] p-4 text-sm text-green-400">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-900 bg-[#1F1515] p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-8 text-[#A3A3A3]">
          Loading orders...
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-10 text-center">
          <h2 className="text-lg font-semibold">No orders found</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            {filter === 'All'
              ? 'Orders placed by customers will appear here.'
              : `There are no orders with the status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#333333] bg-[#1A1A1A]">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#222222] text-[#A3A3A3]">
              <tr>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-[#333333] align-top"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-[#A3A3A3]">
                      {order.items?.length || 0} item type(s)
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p>{order.customer?.name || 'Unknown customer'}</p>
                    <p className="mt-1 text-xs text-[#A3A3A3]">
                      {order.customer?.email || 'No email available'}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-[#A3A3A3]">
                    {dateFormat(order.createdAt)}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {currency(order.total)}
                    <p className="mt-1 text-xs text-[#A3A3A3]">
                      {order.paymentMethod || 'COD'}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      aria-label={`Status for ${order.orderNumber}`}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        updateStatus(order.id, event.target.value)
                      }
                      className="max-w-40 rounded-lg border border-[#444444] bg-[#222222] px-3 py-2 text-sm text-white outline-none focus:border-[#FF5722] disabled:opacity-50"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updatingId === order.id && (
                      <p className="mt-2 text-xs text-[#A3A3A3]">
                        Saving...
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-lg border border-[#444444] px-3 py-2 text-sm transition hover:border-[#FF5722] hover:text-[#FF7043]"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#444444] bg-[#1A1A1A] p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="order-details-title" className="text-xl font-bold">
                  Order Details
                </h2>
                <p className="mt-1 text-sm text-[#A3A3A3]">
                  {selectedOrder.orderNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg px-3 py-1 text-xl text-[#A3A3A3] hover:bg-[#2D2D2D] hover:text-white"
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p className="mt-2 text-sm">{selectedOrder.customer?.name || 'Unknown'}</p>
                <p className="mt-1 break-all text-sm text-[#A3A3A3]">
                  {selectedOrder.customer?.email || 'No email available'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Order Information</h3>
                <p className="mt-2 text-sm text-[#A3A3A3]">
                  Date: {dateFormat(selectedOrder.createdAt)}
                </p>
                <p className="mt-1 text-sm text-[#A3A3A3]">
                  Status: {selectedOrder.status}
                </p>
                <p className="mt-1 text-sm text-[#A3A3A3]">
                  Payment: {selectedOrder.paymentMethod || 'COD'}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#333333] pt-5">
              <h3 className="font-semibold">Items</h3>

              <div className="mt-3 space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={`${item.product || item.name}-${item.size}-${index}`}
                    className="flex items-start justify-between gap-4 rounded-lg bg-[#222222] p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-sm text-[#A3A3A3]">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="whitespace-nowrap font-medium">
                      {currency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-[#333333] pt-4 text-sm">
              <div className="flex justify-between gap-4 text-[#A3A3A3]">
                <span>Subtotal</span>
                <span>{currency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-[#A3A3A3]">
                <span>Shipping</span>
                <span>{currency(selectedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{currency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-[#222222] p-4">
              <h3 className="font-semibold">Delivery Address</h3>
              <p className="mt-2 text-sm">
                {selectedOrder.shippingAddress?.recipientName}
              </p>
              <p className="mt-1 text-sm text-[#A3A3A3]">
                {selectedOrder.shippingAddress?.addressLine}
              </p>
              <p className="mt-1 text-sm text-[#A3A3A3]">
                {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} —{' '}
                {selectedOrder.shippingAddress?.pincode}
              </p>
              <p className="mt-1 text-sm text-[#A3A3A3]">
                Phone: {selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-lg bg-[#FF5722] px-4 py-3 font-semibold text-white transition hover:bg-[#FF7043]"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default Orders;
