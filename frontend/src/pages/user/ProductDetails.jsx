
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    startBuyNow,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products from the backend.
  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError('');
      setProduct(null);

      try {
        const [productResponse, productsResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
        ]);

        if (cancelled) return;

        const fetchedProduct = productResponse.data.product;
        const fetchedProducts = productsResponse.data.products ?? [];

        if (!fetchedProduct) {
          setError('Product not found.');
          return;
        }

        const normalizedProduct = {
          ...fetchedProduct,
          id: String(fetchedProduct._id ?? fetchedProduct.id),
        };

        const normalizedProducts = fetchedProducts.map((item) => ({
          ...item,
          id: String(item._id ?? item.id),
        }));

        setProduct(normalizedProduct);
        setAllProducts(normalizedProducts);

        const sizes = normalizedProduct.sizes?.length
          ? normalizedProduct.sizes
          : ['M'];

        setSelectedSize((currentSize) =>
          sizes.includes(currentSize) ? currentSize : sizes[0]
        );
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to fetch product:', err);

        if (err.response?.status === 404) {
          setError('Product not found. It may have been removed.');
        } else {
          setError(
            'Unable to load this product. Please check your connection and try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const availableSizes = product?.sizes?.length
    ? product.sizes
    : ['M'];

  // Find the cart entry for this product and selected size.
  const cartItem = cartItems.find(
    (item) =>
      String(item.id ?? item._id) === String(product?.id) &&
      item.size === selectedSize
  );

  // The displayed quantity comes directly from the cart.
  // There is no separate local quantity state.
  const quantity = cartItem?.quantity ?? 0;

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return allProducts
      .filter(
        (item) =>
          String(item.id) !== String(product.id) &&
          item.category === product.category
      )
      .slice(0, 4);
  }, [allProducts, product]);

  // Clicking + immediately adds the product or increases its quantity.
  const handleIncrease = () => {
    if (!product) return;

    if (cartItem) {
      updateQuantity(
        product.id,
        selectedSize,
        cartItem.quantity + 1
      );
    } else {
      addToCart(product, selectedSize, 1);
    }
  };

  // Clicking - immediately decreases the cart quantity.
  // If quantity reaches zero, remove that product-size combination.
  const handleDecrease = () => {
    if (!product || !cartItem) return;

    if (cartItem.quantity <= 1) {
      removeFromCart(product.id, selectedSize);
    } else {
      updateQuantity(
        product.id,
        selectedSize,
        cartItem.quantity - 1
      );
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    startBuyNow(product, selectedSize, quantity > 0 ? quantity : 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <section className="bg-[#121212] px-4 py-24 text-center">
        <p className="text-sm font-semibold text-[#A3A3A3]">
          Loading product...
        </p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="bg-[#121212] px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
            Product unavailable
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#F5F5F5]">
            {error || "We couldn't find that product."}
          </h1>

          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
          >
            Back to shop
          </Link>

          {error && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-3 mt-8 rounded-lg border border-[#333333] px-6 py-3 text-sm font-bold text-[#F5F5F5] transition hover:border-[#FF5722]"
            >
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#121212]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product image */}
          <div className="overflow-hidden rounded-2xl border border-[#333333] bg-[#1F1F1F]">
            <div className="aspect-[4/5] w-full">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product information */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#F5F5F5] sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-4">
              <p className="text-2xl font-black text-[#F5F5F5]">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </p>

              {product.originalPrice && (
                <p className="text-lg text-[#666666] line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <p className="mt-6 leading-7 text-[#A3A3A3]">
              {product.description}
            </p>

            {/* Size selection */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A3]">
                  Size
                </p>

                <span className="text-sm font-bold text-[#F5F5F5]">
                  {selectedSize}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  const sizeCartItem = cartItems.find(
                    (item) =>
                      String(item.id ?? item._id) ===
                        String(product.id) &&
                      item.size === size
                  );

                  const sizeQuantity = sizeCartItem?.quantity ?? 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-14 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        selectedSize === size
                          ? 'border-[#FF5722] bg-[#FF5722] text-white'
                          : 'border-[#333333] bg-[#1F1F1F] text-[#A3A3A3] hover:border-[#555555] hover:text-[#F5F5F5]'
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

            {/* Quantity controls: cart updates immediately */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#A3A3A3]">
                Quantity
              </p>

              <div className="flex h-12 w-fit overflow-hidden rounded-lg border border-[#333333] bg-[#1F1F1F]">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity === 0}
                  aria-label="Decrease quantity"
                  className="flex w-12 items-center justify-center text-xl font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <div
                  className="flex w-16 items-center justify-center border-x border-[#333333] text-sm font-bold text-[#F5F5F5]"
                  aria-live="polite"
                >
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="flex w-12 items-center justify-center text-xl font-bold text-[#F5F5F5] transition hover:bg-[#FF5722] hover:text-white"
                >
                  +
                </button>
              </div>

              <p className="mt-2 text-xs text-[#666666]">
                Quantity changes are saved to your cart automatically.
              </p>
            </div>

            {/* Buy now only; Add/Update Cart button removed */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="mt-8 w-full rounded-lg bg-[#FF5722] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
            >
              Buy now
            </button>

            <Link
              to="/cart"
              className="mt-4 text-center text-sm font-semibold text-[#A3A3A3] transition hover:text-[#FF5722]"
            >
              View cart →
            </Link>

            {/* Benefits */}
            <div className="mt-10 grid gap-4 border-t border-[#333333] pt-8 sm:grid-cols-3">
              <div>
                <p className="text-sm font-bold text-[#F5F5F5]">
                  Free shipping
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666666]">
                  On orders above ₹2,000
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-[#F5F5F5]">
                  Easy returns
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666666]">
                  Simple return process
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-[#F5F5F5]">
                  Secure checkout
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666666]">
                  Your information stays protected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-[#333333] pt-16">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
                You may also like
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#F5F5F5] sm:text-3xl">
                More from {product.category}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductDetails;
