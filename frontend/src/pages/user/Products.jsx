
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';

const categories = [
  'All',
  'Men',
  'Women',
  'Unisex',
  'Accessories',
];

function Products() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get('category');
  const initialCategory = categories.includes(categoryFromUrl)
    ? categoryFromUrl
    : 'All';

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);
  const [sortOption, setSortOption] = useState('featured');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep the selected category synchronized with the URL.
  useEffect(() => {
    const category = searchParams.get('category');

    setSelectedCategory(
      categories.includes(category) ? category : 'All'
    );
  }, [searchParams]);

  // Update the category in the URL when a category is selected.
  function handleCategoryChange(category) {
    setSelectedCategory(category);

    const nextParams = new URLSearchParams(searchParams);

    if (category === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }

    setSearchParams(nextParams);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/products');

        if (!cancelled) {
          setProducts(response.data.products ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch products:', err);

          setError(
            'Unable to load products. Please check your connection and try again.'
          );
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

  const filteredProducts = useMemo(() => {
    let result =
      selectedCategory === 'All'
        ? [...products]
        : products.filter(
            (product) => product.category === selectedCategory
          );

    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, sortOption]);

  return (
    <section className="bg-[#121212]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
            Shop
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#F5F5F5] sm:text-4xl">
            Built for your grind.
          </h1>

          <p className="mt-3 max-w-2xl text-[#A3A3A3]">
            Performance-focused clothing and accessories designed
            for training, movement, and everyday wear.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-5 border-y border-[#333333] py-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Category buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-[#FF5722] text-white'
                    : 'border border-[#333333] text-[#A3A3A3] hover:border-[#555555] hover:text-[#F5F5F5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="text-sm text-[#A3A3A3]"
            >
              Sort by
            </label>

            <select
              id="sort"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="rounded-lg border border-[#333333] bg-[#1F1F1F] px-3 py-2 text-sm text-[#F5F5F5] outline-none transition focus:border-[#FF5722]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-[#A3A3A3]">
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] px-6 py-12 text-center">
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

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[#A3A3A3]">
                Showing{' '}
                <span className="font-semibold text-[#F5F5F5]">
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      id: product._id,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] px-6 py-16 text-center">
                <h2 className="text-xl font-bold text-[#F5F5F5]">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-[#A3A3A3]">
                  Try selecting a different category.
                </p>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('All')}
                  className="mt-6 rounded-lg bg-[#FF5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF7043]"
                >
                  View all products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Products;
