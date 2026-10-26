
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

function normalizeCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    id: String(item.id ?? item._id ?? ''),
    quantity: Math.max(
      1,
      Math.min(
        100,
        Math.floor(Number(item.quantity) || 1)
      )
    ),
  }));
}

function CartProvider({ children }) {
  const { user, isLoadingUser } = useAuth();

  const userId = String(user?.id ?? user?._id ?? '');

  const [cartItems, setCartItems] = useState([]);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [cartLoadedFor, setCartLoadedFor] = useState(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const saveTimer = useRef(null);
  const saveQueue = useRef(Promise.resolve());
  const cartRevision = useRef(0);
  const currentUserId = useRef(userId);

  currentUserId.current = userId;

  // Serialize cart writes so an older save cannot overwrite
  // a later clear-cart request.
  const enqueueCartRequest = (request) => {
    const nextRequest = saveQueue.current
      .catch(() => undefined)
      .then(request);

    saveQueue.current = nextRequest.catch(() => undefined);

    return nextRequest;
  };

  // Load the cart belonging to the signed-in account.
  useEffect(() => {
    let cancelled = false;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    cartRevision.current += 1;

    setCartItems([]);
    setBuyNowItem(null);
    setCartLoadedFor(null);

    async function loadCart() {
      if (isLoadingUser) {
        return;
      }

      if (!userId) {
        setIsLoadingCart(false);
        return;
      }

      setIsLoadingCart(true);

      try {
        const response = await api.get('/cart');

        if (cancelled) {
          return;
        }

        setCartItems(
          normalizeCartItems(response.data.cart?.items)
        );

        setCartLoadedFor(userId);
      } catch (error) {
        if (!cancelled) {
          setCartItems([]);
          setCartLoadedFor(null);

          console.error(
            'Unable to load cart:',
            error.response?.data?.message ??
              error.message
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCart(false);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;

      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [userId, isLoadingUser]);

  // Automatically save changes to MongoDB.
  useEffect(() => {
    if (
      isLoadingUser ||
      !userId ||
      cartLoadedFor !== userId
    ) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    const revision = cartRevision.current;

    const itemsToSave = cartItems.map((item) => ({
      productId: String(item.id ?? item._id),
      size: item.size,
      quantity: item.quantity,
    }));

    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;

      enqueueCartRequest(async () => {
        // Ignore an obsolete save if the cart has changed.
        if (
          revision !== cartRevision.current ||
          currentUserId.current !== userId
        ) {
          return;
        }

        await api.put('/cart', {
          items: itemsToSave,
        });
      }).catch((error) => {
        console.error(
          'Unable to save cart:',
          error.response?.data?.message ??
            error.message
        );
      });
    }, 300);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [
    cartItems,
    userId,
    cartLoadedFor,
    isLoadingUser,
  ]);

  // Add a product or increase its existing quantity.
  const addToCart = (product, size, quantity = 1) => {
    if (!userId || cartLoadedFor !== userId) {
      return;
    }

    const productId = String(
      product.id ?? product._id ?? ''
    );

    const amount = Math.floor(Number(quantity));

    if (
      !productId ||
      !size ||
      !Number.isFinite(amount) ||
      amount < 1
    ) {
      return;
    }

    cartRevision.current += 1;

    const normalizedProduct = {
      ...product,
      id: productId,
    };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          String(item.id ?? item._id) === productId &&
          item.size === size
      );

      if (existingItem) {
        return currentItems.map((item) =>
          String(item.id ?? item._id) === productId &&
          item.size === size
            ? {
                ...item,
                id: productId,
                quantity: Math.min(
                  100,
                  item.quantity + amount
                ),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...normalizedProduct,
          size,
          quantity: Math.min(100, amount),
        },
      ];
    });
  };

  // Remove a product in a particular size.
  const removeFromCart = (productId, size) => {
    const normalizedId = String(productId);

    if (!userId || cartLoadedFor !== userId) {
      return;
    }

    cartRevision.current += 1;

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            String(item.id ?? item._id) ===
              normalizedId &&
            item.size === size
          )
      )
    );
  };

  // Update a product quantity.
  const updateQuantity = (
    productId,
    size,
    quantity
  ) => {
    const normalizedId = String(productId);
    const newQuantity = Math.floor(Number(quantity));

    if (!userId || cartLoadedFor !== userId) {
      return;
    }

    if (
      !Number.isFinite(newQuantity) ||
      newQuantity <= 0
    ) {
      removeFromCart(normalizedId, size);
      return;
    }

    cartRevision.current += 1;

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id ?? item._id) === normalizedId &&
        item.size === size
          ? {
              ...item,
              id: normalizedId,
              quantity: Math.min(100, newQuantity),
            }
          : item
      )
    );
  };

  // Clear the cart in the UI and in MongoDB.
  const clearCart = async () => {
    if (!userId || cartLoadedFor !== userId) {
      return {
        success: false,
        message: 'Your cart has not finished loading.',
      };
    }

    const clearingUserId = userId;

    // Cancel a pending debounced save.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    // Invalidate saves created before this clear operation.
    cartRevision.current += 1;

    // Empty the UI immediately.
    setCartItems([]);

    try {
      // Wait for earlier writes, then clear this user's cart.
      await enqueueCartRequest(async () => {
        if (
          currentUserId.current !== clearingUserId
        ) {
          throw new Error(
            'The signed-in account changed.'
          );
        }

        await api.delete('/cart');
      });

      return { success: true };
    } catch (error) {
      console.error(
        'Unable to clear cart:',
        error.response?.data?.message ??
          error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message ??
          'Unable to clear your saved cart.',
      };
    }
  };

  // Buy Now is separate from the normal cart.
  const startBuyNow = (product, size, quantity) => {
    const productId = String(
      product.id ?? product._id ?? ''
    );

    const amount = Math.floor(Number(quantity));

    if (
      !productId ||
      !size ||
      !Number.isFinite(amount) ||
      amount < 1
    ) {
      return;
    }

    setBuyNowItem({
      ...product,
      id: productId,
      size,
      quantity: Math.min(100, amount),
    });
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    buyNowItem,
    startBuyNow,
    clearBuyNow,
    isLoadingCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}

export default CartProvider;
