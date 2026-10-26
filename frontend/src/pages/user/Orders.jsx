import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { useOrder } from '../../context/OrderContext';

function getStatusClass(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-[#22C55E]/10 text-[#22C55E]';

    case 'Shipped':
      return 'bg-blue-500/10 text-blue-400';

    case 'Processing':
      return 'bg-[#FF5722]/10 text-[#FF5722]';

    case 'Cancelled':
      return 'bg-[#E63946]/10 text-[#E63946]';

    default:
      return 'bg-[#2D2D2D] text-[#A3A3A3]';
  }
}

function formatOrderDate(date) {
  return new Date(date).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
}

function Orders() {
  const { getUserOrders } = useOrder();
  const location = useLocation();

  const [showSuccess, setShowSuccess] =
    useState(false);

  const orders = getUserOrders();

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setShowSuccess(true);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF5722]">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
          My Orders
        </h1>

        <p className="mt-3 text-[#A3A3A3]">
          View your order history and delivery details.
        </p>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="mb-6 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-5 py-4">
          <p className="font-semibold text-[#22C55E]">
            Order placed successfully!
          </p>

          <p className="mt-1 text-sm text-[#A3A3A3]">
            Your order has been added to your order history.
          </p>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[#333333] bg-[#1F1F1F] px-6 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2D2D2D] text-[#A3A3A3]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 3.75h6M9.75 3.75a2.25 2.25 0 0 1 4.5 0M5.25 6.75h13.5l-.9 12.15a1.5 1.5 0 0 1-1.5 1.35H7.65a1.5 1.5 0 0 1-1.5-1.35l-.9-12.15Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 10.5v5.25M14.25 10.5v5.25"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-[#F5F5F5]">
            No orders yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm text-[#A3A3A3]">
            Once you place an order, it will appear here.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-[#333333] bg-[#1F1F1F]"
            >
              {/* Order header */}
              <div className="border-b border-[#333333] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#666666]">
                      Order
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#F5F5F5]">
                      {order.id}
                    </h2>

                    <p className="mt-1 text-sm text-[#A3A3A3]">
                      {formatOrderDate(order.date)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <p className="mt-2 text-lg font-bold text-[#F5F5F5]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#333333]">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.id}-${item.size}`}
                    className="flex gap-4 p-5 sm:p-6"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-20 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#F5F5F5]">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#A3A3A3]">
                        Size: {item.size}
                      </p>

                      <p className="mt-1 text-sm text-[#A3A3A3]">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-3 font-semibold text-[#F5F5F5]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping details */}
              <div className="border-t border-[#333333] p-5 sm:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
                  Delivery address
                </h3>

                <div className="mt-3 text-sm leading-6 text-[#A3A3A3]">
                  <p className="font-medium text-[#F5F5F5]">
                    {order.shippingAddress.recipientName}
                  </p>

                  <p>
                    {order.shippingAddress.addressLine}
                  </p>

                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
                  </p>

                  <p>
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Order footer */}
              <div className="flex flex-col gap-3 border-t border-[#333333] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="text-sm text-[#A3A3A3]">
                  {order.items.length}{' '}
                  {order.items.length === 1
                    ? 'product'
                    : 'products'}
                  {' · '}
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : 'Online Payment'}
                </div>

                <p className="text-sm text-[#A3A3A3]">
                  Order status:{' '}
                  <span className="font-semibold text-[#F5F5F5]">
                    {order.status}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;