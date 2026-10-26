
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/products');
        const fetchedProducts = response.data.products ?? [];

        if (!cancelled) {
          setProducts(
            fetchedProducts.map((product) => ({
              ...product,
              id: product._id || product.id,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load home products:', err);

        if (!cancelled) {
          setError('Unable to load products right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredProducts = products.slice(0, 4);

  const menProduct = products.find(
    (product) => product.category === 'Men'
  );

  const womenProduct = products.find(
    (product) => product.category === 'Women'
  );

  const accessoryProduct = products.find(
    (product) => product.category === 'Accessories'
  );

  const heroProduct = products[0];

  const imageFallback =
    'https://placehold.co/800x1000/1F1F1F/F5F5F5?text=Fit+Forge';

  return (
    <div className="bg-[#121212] text-[#F5F5F5]">
      {/* Hero */}
      <section className="border-b border-[#333333]">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#FF5722]">
              Train harder. Move better.
            </p>

            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-[#F5F5F5] sm:text-6xl lg:text-7xl">
              Built to
              <span className="block text-[#FF5722]">
                perform.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#A3A3A3]">
              Performance-focused clothing and accessories
              designed for training, movement, and everyday life.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
              >
                Shop now
              </Link>

              <a
                href="#featured"
                className="rounded-lg border border-[#333333] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#F5F5F5] transition hover:border-[#FF5722] hover:text-[#FF5722]"
              >
                Explore collection
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[#333333] bg-[#1F1F1F]">
              {loading ? (
                <div className="flex aspect-[4/5] items-center justify-center text-[#A3A3A3]">
                  Loading collection...
                </div>
              ) : (
                <img
                  src={heroProduct?.image || imageFallback}
                  alt={heroProduct?.name || 'Fit Forge collection'}
                  className="aspect-[4/5] w-full object-cover"
                />
              )}
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[#333333] bg-[#1F1F1F] px-5 py-4 shadow-xl sm:block">
              <p className="text-xs uppercase tracking-wider text-[#A3A3A3]">
                Featured
              </p>

              <p className="mt-1 font-bold text-[#F5F5F5]">
                Performance Collection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-b border-[#333333]"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
              Categories
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Find your fit.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Men's",
                category: 'Men',
                product: menProduct,
                description: 'Performance gear built for training.',
              },
              {
                title: "Women's",
                category: 'Women',
                product: womenProduct,
                description: 'Designed for movement and comfort.',
              },
              {
                title: 'Accessories',
                category: 'Accessories',
                product: accessoryProduct,
                description: 'The essentials that complete your setup.',
              },
            ].map((item) => (
              <Link
                key={item.category}
                to={`/products?category=${encodeURIComponent(item.category)}`}
                className="group overflow-hidden rounded-xl border border-[#333333] bg-[#1F1F1F]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#2D2D2D]">
                  <img
                    src={item.product?.image || imageFallback}
                    alt={`${item.title} collection`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                    Collection
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#A3A3A3]">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        id="featured"
        className="border-b border-[#333333]"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
                Featured
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Built for the grind.
              </h2>
            </div>

            <Link
              to="/products"
              className="text-sm font-semibold text-[#FF5722] transition hover:text-[#FF7043]"
            >
              View all products →
            </Link>
          </div>

          {loading && (
            <p className="py-10 text-center text-[#A3A3A3]">
              Loading products...
            </p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] px-6 py-10 text-center">
              <p className="text-[#F5F5F5]">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-[#FF5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF7043]"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && featuredProducts.length === 0 && (
            <p className="py-10 text-center text-[#A3A3A3]">
              No products are available right now.
            </p>
          )}

          {!loading && !error && featuredProducts.length > 0 && (
            <>
              <p className="mb-5 text-sm text-[#A3A3A3]">
                Showing {featuredProducts.length} featured{' '}
                {featuredProducts.length === 1 ? 'product' : 'products'}
                {' '}out of {products.length} available products.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Fit Forge */}
      <section className="border-b border-[#333333]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
              Why Fit Forge
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Made with purpose.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Performance first',
                description:
                  'Designed around movement, comfort, and the demands of serious training.',
              },
              {
                number: '02',
                title: 'Built for everyday',
                description:
                  'Gear that works just as well outside the gym as it does during your workout.',
              },
              {
                number: '03',
                title: 'Simple. Reliable.',
                description:
                  'No unnecessary complexity. Just dependable products made to keep up with you.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FF5722] text-lg font-black text-white">
                  {item.number}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
            Ready?
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Forge your fit.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[#A3A3A3]">
            Explore the collection and find gear that is
            ready to move with you.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-[#FF5722] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
