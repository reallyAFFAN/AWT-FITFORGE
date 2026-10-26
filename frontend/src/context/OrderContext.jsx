
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import api from '../services/api';

const OrderContext = createContext(null);

function normalizeOrder(order, userEmail = '') {
  return {
    ...order,
    id: String(order.id ?? order._id ?? ''),
    date: order.createdAt ?? order.date ?? null,
    userEmail,
    items: (order.items ?? []).map((item) => ({
      ...item,
      id: String(
        item.product?._id ??
        item.product ??
        item.id ??
        item.productId ??
        ''
      ),
    })),
  };
}

function OrderProvider({ children }) {
  const { user, isLoadingUser } = useAuth();

  const userId = String(user?.id ?? user?._id ?? '');
  const userEmail = user?.email ?? '';

  const [orders, setOrders] = useState([]);
  const [ordersOwnerId, setOrdersOwnerId] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      // Wait until authentication restoration has finished.
      if (isLoadingUser) {
        return;
      }

      // Never keep the previous user's orders after logout.
      setOrders([]);
      setOrdersOwnerId(null);

      if (!userId) {
        setIsLoadingOrders(false);
        return;
      }

      setIsLoadingOrders(true);

      try {
        // The backend scopes this response using the JWT.
        const response = await api.get('/orders');
        const fetchedOrders = response.data.orders ?? [];

        if (!cancelled) {
          setOrders(
            fetchedOrders.map((order) =>
              normalizeOrder(order, userEmail)
            )
          );

          setOrdersOwnerId(userId);
        }
      } catch (error) {
        if (!cancelled) {
          setOrders([]);
          setOrdersOwnerId(null);

          console.error(
            'Failed to load orders:',
            error.response?.data?.message ?? error.message
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrders(false);
        }
      }
    }

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [userId, userEmail, isLoadingUser]);

  const createOrder = async ({
    items,
    shippingAddress,
    paymentMethod = 'COD',
  }) => {
    if (!userId) {
      return {
        success: false,
        message: 'You must be logged in to place an order.',
      };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        message: 'Your order has no items.',
      };
    }

    try {
      const response = await api.post('/orders', {
        items: items.map((item) => ({
          productId: String(
            item.productId ?? item.id ?? item._id ?? ''
          ),
          size: item.size,
          quantity: Number(item.quantity),
        })),
        shippingAddress,
        paymentMethod,
      });

      const savedOrder = normalizeOrder(
        response.data.order,
        userEmail
      );

      // Only update the order list for the account that placed it.
      setOrdersOwnerId(userId);
      setOrders((currentOrders) => [
        savedOrder,
        ...currentOrders.filter(
          (order) => order.id !== savedOrder.id
        ),
      ]);

      return {
        success: true,
        order: savedOrder,
        message:
          response.data.message ?? 'Order placed successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          'Unable to place your order. Please try again.',
      };
    }
  };

  const getUserOrders = () => {
    // Do not expose stale orders belonging to another account.
    if (!userId || ordersOwnerId !== userId) {
      return [];
    }

    // The server has already restricted this list to the owner.
    return orders;
  };

  const getOrderById = (orderId) => {
    if (!userId || ordersOwnerId !== userId) {
      return null;
    }

    return (
      orders.find(
        (order) => order.id === String(orderId)
      ) ?? null
    );
  };

  const value = {
    orders: getUserOrders(),
    isLoadingOrders,
    createOrder,
    getUserOrders,
    getOrderById,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      'useOrder must be used inside an OrderProvider'
    );
  }

  return context;
}

export default OrderProvider;
