
import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  category: '',
  sizes: 'S, M, L, XL',
  stock: '0',
};

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load products.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setError('');
    setMessage('');
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setError('');
    setMessage('');
    setEditingId(product._id || product.id);

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      originalPrice:
        product.originalPrice == null
          ? ''
          : String(product.originalPrice),
      image: product.image || '',
      category: product.category || '',
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(', ')
        : '',
      stock: String(product.stock ?? 0),
    });

    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const price = Number(form.price);
    const stock = Number(form.stock);
    const originalPrice =
      form.originalPrice.trim() === ''
        ? undefined
        : Number(form.originalPrice);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        'Enter a valid non-negative price and whole-number stock quantity.'
      );
      return;
    }

    if (
      originalPrice !== undefined &&
      (!Number.isFinite(originalPrice) || originalPrice < 0)
    ) {
      setError('Enter a valid original price.');
      return;
    }

    const sizes = form.sizes
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean);

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      image: form.image.trim(),
      category: form.category.trim(),
      sizes,
      stock,
      isActive: true,
    };

    if (originalPrice !== undefined) {
      productData.originalPrice = originalPrice;
    }

    setSaving(true);

    try {
      if (editingId) {
        const response = await api.put(
          `/products/${editingId}`,
          productData
        );

        setMessage(
          response.data.message || 'Product updated successfully.'
        );
      } else {
        const response = await api.post(
          '/products',
          productData
        );

        setMessage(
          response.data.message || 'Product added successfully.'
        );
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;

      setError(
        Array.isArray(validationErrors)
          ? validationErrors.join(' ')
          : err.response?.data?.message ||
              'Unable to save the product.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (product) => {
    const confirmed = window.confirm(
      `Deactivate "${product.name}"? It will no longer appear in the customer store.`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const response = await api.delete(
        `/products/${product._id || product.id}`
      );

      setMessage(
        response.data.message || 'Product deactivated successfully.'
      );

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to deactivate the product.'
      );
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#FF7043]">Store management</p>
          <h1 className="mt-1 text-3xl font-bold">Products</h1>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Add, edit, and manage products in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-lg bg-[#FF5722] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF7043]"
        >
          + Add Product
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-green-900 bg-[#142019] p-4 text-sm text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-900 bg-[#1F1515] p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <section className="mb-8 rounded-xl border border-[#333333] bg-[#1A1A1A] p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-3 py-2 text-sm text-[#A3A3A3] hover:bg-[#2D2D2D] hover:text-white"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Product Name *
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="e.g. Performance Training T-Shirt"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Category *
                </span>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="e.g. T-Shirts"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Selling Price (₹) *
                </span>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="999"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Original Price (₹)
                </span>
                <input
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="Optional"
                />
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-2 block text-[#A3A3A3]">
                  Image URL *
                </span>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="https://example.com/product.jpg"
                />
              </label>

              {form.image.trim() && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-sm text-[#A3A3A3]">
                    Image preview
                  </p>
                  <img
                    src={form.image}
                    alt="Product preview"
                    className="h-36 w-36 rounded-lg border border-[#333333] object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
              )}

              <label className="block text-sm sm:col-span-2">
                <span className="mb-2 block text-[#A3A3A3]">
                  Description *
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full resize-y rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="Describe the product..."
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Available Sizes
                </span>
                <input
                  name="sizes"
                  value={form.sizes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                  placeholder="S, M, L, XL"
                />
                <span className="mt-1 block text-xs text-[#A3A3A3]">
                  Separate sizes with commas.
                </span>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-[#A3A3A3]">
                  Stock Quantity
                </span>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-lg border border-[#444444] bg-[#222222] px-4 py-3 text-white outline-none focus:border-[#FF5722]"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF7043] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Product'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-[#444444] px-6 py-3 text-sm text-white transition hover:border-[#FF5722]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#A3A3A3]">
            {products.length} active product
            {products.length === 1 ? '' : 's'}
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-[#444444] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none focus:border-[#FF5722] sm:max-w-xs"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-8 text-[#A3A3A3]">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-[#333333] bg-[#1A1A1A] p-10 text-center">
          <h2 className="text-lg font-semibold">
            {products.length === 0
              ? 'No active products'
              : 'No matching products'}
          </h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            {products.length === 0
              ? 'Use Add Product to create your first product.'
              : 'Try another search term.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#333333] bg-[#1A1A1A]">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#222222] text-[#A3A3A3]">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Sizes</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id || product.id}
                  className="border-t border-[#333333] align-middle"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 rounded-lg bg-[#2D2D2D] object-cover"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                      <div className="max-w-xs">
                        <p className="font-medium">{product.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#A3A3A3]">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[#A3A3A3]">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {currency(product.price)}
                  </td>

                  <td className="px-5 py-4">
                    {product.stock ?? 0}
                  </td>

                  <td className="px-5 py-4 text-[#A3A3A3]">
                    {Array.isArray(product.sizes) &&
                    product.sizes.length > 0
                      ? product.sizes.join(', ')
                      : 'One size'}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="rounded-lg border border-[#444444] px-3 py-2 text-xs transition hover:border-[#FF5722] hover:text-[#FF7043]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(product)}
                        className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-400 transition hover:bg-red-950"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Products;
