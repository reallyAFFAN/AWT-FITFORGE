import { Link } from 'react-router';

import { useCart } from '../../context/CartContext';

function Cart() {
  const {
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const shippingCost =
    cartSubtotal >= 2000 || cartSubtotal === 0
      ? 0
      : 99;

  const total = cartSubtotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <section className="bg-[#121212] px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1F1F1F] text-[#A3A3A3]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.4 12.2a2 2 0 001.96 1.6h8.88a2 2 0 001.95-1.55L22 7H6"
              />

              <circle
                cx="9"
                cy="20"
                r="1"
              />

              <circle
                cx="18"
                cy="20"
                r="1"
              />
            </svg>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
            Your cart
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#F5F5F5]">
            Your cart is empty.
          </h1>

          <p className="mt-3 text-[#A3A3A3]">
            Looks like you haven't added anything yet.
            Find something you like and start building
            your collection.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-[#FF5722] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
          >
            Start shopping
          </Link>

        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#121212]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
              Your cart
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#F5F5F5] sm:text-4xl">
              Ready to check out?
            </h1>

            <p className="mt-2 text-[#A3A3A3]">
              {cartItems.length}{' '}
              {cartItems.length === 1
                ? 'item'
                : 'items'}{' '}
              in your cart.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="self-start rounded-lg border border-[#333333] px-4 py-2 text-sm font-semibold text-[#A3A3A3] transition hover:border-[#E63946] hover:text-[#E63946] sm:self-auto"
          >
            Clear cart
          </button>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* Cart Items */}
          <div className="space-y-4">

            {cartItems.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-4 sm:p-5"
              >
                <div className="flex gap-4 sm:gap-6">

                  {/* Image */}
                  <Link
                    to={`/products/${item.id}`}
                    className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[#2D2D2D] sm:h-36 sm:w-28"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </Link>

                  {/* Information */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">
                          {item.category}
                        </p>

                        <Link
                          to={`/products/${item.id}`}
                          className="mt-1 block text-base font-bold text-[#F5F5F5] transition hover:text-[#FF5722] sm:text-lg"
                        >
                          {item.name}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.size
                          )
                        }
                        aria-label={`Remove ${item.name} from cart`}
                        className="shrink-0 text-[#666666] transition hover:text-[#E63946]"
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
                            d="M6 7h12M9 7V4h6v3m2 0l-.7 13H7.7L7 7m4 4v6m2-6v6"
                          />
                        </svg>
                      </button>

                    </div>

                    {/* Size */}
                    <p className="mt-3 text-sm text-[#A3A3A3]">
                      Size:{' '}
                      <span className="font-semibold text-[#F5F5F5]">
                        {item.size}
                      </span>
                    </p>

                    {/* Price */}
                    <p className="mt-2 text-sm font-semibold text-[#F5F5F5]">
                      ₹{item.price.toLocaleString('en-IN')}{' '}
                      each
                    </p>

                    {/* Bottom controls */}
                    <div className="mt-5 flex items-center justify-between gap-4">

                      {/* Quantity */}
                      <div className="flex h-10 overflow-hidden rounded-lg border border-[#333333] bg-[#121212]">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="flex w-10 items-center justify-center text-lg font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <div className="flex w-12 items-center justify-center border-x border-[#333333] text-sm font-bold text-[#F5F5F5]">
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="flex w-10 items-center justify-center text-lg font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>

                      {/* Item total */}
                      <p className="text-lg font-black text-[#F5F5F5]">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString('en-IN')}
                      </p>

                    </div>

                  </div>
                </div>
              </article>
            ))}

            {/* Continue Shopping */}
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center text-sm font-semibold text-[#FF5722] transition hover:text-[#FF7043]"
              >
                ← Continue shopping
              </Link>
            </div>

          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-6">

              <h2 className="text-xl font-bold text-[#F5F5F5]">
                Order summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A3A3A3]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#F5F5F5]">
                    ₹
                    {cartSubtotal.toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A3A3A3]">
                    Shipping
                  </span>

                  <span className="font-semibold text-[#F5F5F5]">
                    {shippingCost === 0
                      ? 'FREE'
                      : `₹${shippingCost}`}
                  </span>
                </div>

                <div className="border-t border-[#333333] pt-4">
                  <div className="flex items-center justify-between">

                    <span className="font-bold text-[#F5F5F5]">
                      Total
                    </span>

                    <span className="text-2xl font-black text-[#F5F5F5]">
                      ₹
                      {total.toLocaleString(
                        'en-IN'
                      )}
                    </span>

                  </div>
                </div>

              </div>

              {/* Free Shipping Message */}
              {cartSubtotal < 2000 && (
                <div className="mt-5 rounded-lg border border-[#FF5722]/20 bg-[#FF5722]/10 p-3">
                  <p className="text-xs leading-5 text-[#A3A3A3]">
                    Add ₹
                    {(
                      2000 - cartSubtotal
                    ).toLocaleString('en-IN')}{' '}
                    more to get free shipping.
                  </p>
                </div>
              )}

              {cartSubtotal >= 2000 && (
                <div className="mt-5 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 p-3">
                  <p className="text-xs font-medium text-[#22C55E]">
                    🎉 You qualify for free shipping.
                  </p>
                </div>
              )}

              {/* Checkout */}
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-lg bg-[#FF5722] px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
              >
                Proceed to checkout
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-[#666666]">
                Secure checkout. Your order information
                will be confirmed before placing your
                order.
              </p>

            </div>

          </aside>

        </div>
      </div>
    </section>
  );
}

export default Cart;