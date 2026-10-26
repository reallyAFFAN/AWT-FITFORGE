
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { useCart } from '../../context/CartContext';

function ProductCard({ product }) {
  const {
    cartItems,
    addToCart,
    updateQuantity,
  } = useCart();

  const productId = product._id || product.id;

  // Keep one consistent ID throughout the cart.
  const normalizedProduct = {
    ...product,
    id: productId,
  };

  const availableSizes = product.sizes?.length
    ? product.sizes
    : ['M'];

  const [selectedSize, setSelectedSize] = useState(
    availableSizes[0]
  );

  useEffect(() => {
    setSelectedSize((currentSize) =>
      availableSizes.includes(currentSize)
        ? currentSize
        : availableSizes[0]
    );
  }, [productId, product.sizes]);

  const cartItem = cartItems.find(
    (item) =>
      item.id === productId &&
      item.size === selectedSize
  );

  const quantity = cartItem?.quantity || 0;

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    addToCart(normalizedProduct, selectedSize, 1);
  };

  const handleIncrease = () => {
    if (!cartItem) {
      addToCart(normalizedProduct, selectedSize, 1);
      return;
    }

    updateQuantity(
      productId,
      selectedSize,
      cartItem.quantity + 1
    );
  };

  const handleDecrease = () => {
    if (!cartItem) return;

    updateQuantity(
      productId,
      selectedSize,
      cartItem.quantity - 1
    );
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-[#333333] bg-[#1F1F1F] transition duration-300 hover:-translate-y-1 hover:border-[#555555]">

      {/* Product Image */}
      <Link
        to={`/products/${productId}`}
        className="block overflow-hidden bg-[#2D2D2D]"
      >
        <div className="aspect-[4/5] w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#A3A3A3]">
          {product.category}
        </p>

        <Link to={`/products/${productId}`}>
          <h3 className="mt-2 text-base font-semibold text-[#F5F5F5] transition hover:text-[#FF5722]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-[#F5F5F5]">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          {product.originalPrice && (
            <p className="text-sm text-[#666666] line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Size Selector */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
              Size
            </p>

            <span className="text-xs font-semibold text-[#F5F5F5]">
              {selectedSize}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const sizeCartItem = cartItems.find(
                (item) =>
                  item.id === productId &&
                  item.size === size
              );

              const sizeQuantity = sizeCartItem?.quantity || 0;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`relative min-w-10 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedSize === size
                      ? 'border-[#FF5722] bg-[#FF5722] text-white'
                      : 'border-[#333333] bg-[#121212] text-[#A3A3A3] hover:border-[#555555] hover:text-[#F5F5F5]'
                  }`}
                >
                  {size}

                  {sizeQuantity > 0 && (
                    <span
                      className={`ml-1 ${
                        selectedSize === size
                          ? 'text-white'
                          : 'text-[#FF5722]'
                      }`}
                    >
                      ({sizeQuantity})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart Controls */}
        {quantity === 0 ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 w-full rounded-lg border border-[#333333] px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#F5F5F5] transition hover:border-[#FF5722] hover:bg-[#FF5722] hover:text-white"
          >
            Add to cart
          </button>
        ) : (
          <div className="mt-4 flex h-[42px] items-center overflow-hidden rounded-lg border border-[#FF5722] bg-[#121212]">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label={`Decrease ${product.name} quantity`}
              className="flex h-full w-12 items-center justify-center text-lg font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white"
            >
              −
            </button>

            <div className="flex flex-1 items-center justify-center border-x border-[#333333] text-sm font-bold text-[#F5F5F5]">
              {quantity}
            </div>

            <button
              type="button"
              onClick={handleIncrease}
              aria-label={`Increase ${product.name} quantity`}
              className="flex h-full w-12 items-center justify-center text-lg font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
