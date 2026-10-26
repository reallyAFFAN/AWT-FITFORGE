
import { Router } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Every order endpoint requires a valid login.
router.use(authenticateUser);

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function formatOrder(order, includeCustomer = false) {
  const formatted = {
    id: String(order._id),
    orderNumber: order.orderNumber,
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    createdAt: order.createdAt,
  };

  if (includeCustomer) {
    formatted.customer = order.user
      ? {
          id: String(order.user._id),
          name: order.user.name,
          email: order.user.email,
        }
      : null;
  }

  return formatted;
}

// =====================================================
// CUSTOMER: CREATE ORDER
// POST /api/orders
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'COD',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Your order must contain at least one item.',
      });
    }

    if (paymentMethod !== 'COD') {
      return res.status(400).json({
        message: 'This payment method is not supported.',
      });
    }

    const requiredAddressFields = [
      'recipientName',
      'phone',
      'pincode',
      'addressLine',
      'city',
      'state',
    ];

    if (
      !shippingAddress ||
      requiredAddressFields.some(
        (field) =>
          typeof shippingAddress[field] !== 'string' ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        message: 'Please provide a complete shipping address.',
      });
    }

    if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        message: 'Enter a valid 10-digit Indian phone number.',
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        message: 'Enter a valid 6-digit PIN code.',
      });
    }

    // Combine duplicate product and size combinations.
    const quantities = new Map();

    for (const item of items) {
      const productId = String(item.productId ?? item.id ?? '');
      const size = String(item.size ?? '').trim();
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(productId) ||
        !size ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return res.status(400).json({
          message: 'One or more order items are invalid.',
        });
      }

      const key = `${productId}:${size}`;
      const previous = quantities.get(key);
      const nextQuantity = (previous?.quantity ?? 0) + quantity;

      if (nextQuantity > 100) {
        return res.status(400).json({
          message: 'The quantity for an item cannot exceed 100.',
        });
      }

      quantities.set(key, {
        productId,
        size,
        quantity: nextQuantity,
      });
    }

    const productIds = [
      ...new Set(
        [...quantities.values()].map((item) => item.productId)
      ),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const orderItems = [];

    for (const item of quantities.values()) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(400).json({
          message: 'A product in your cart is no longer available.',
        });
      }

      if (
        Array.isArray(product.sizes) &&
        product.sizes.length > 0 &&
        !product.sizes.includes(item.size)
      ) {
        return res.status(400).json({
          message: `Size "${item.size}" is not available for ${product.name}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCost = subtotal >= 2000 ? 0 : 99;
    const total = subtotal + shippingCost;

    const order = await Order.create({
      orderNumber:
        `FF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      user: req.userId,
      items: orderItems,
      shippingAddress: {
        recipientName: shippingAddress.recipientName.trim(),
        phone: shippingAddress.phone.trim(),
        pincode: shippingAddress.pincode.trim(),
        addressLine: shippingAddress.addressLine.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      status: 'Processing',
      subtotal,
      shippingCost,
      total,
    });

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: formatOrder(order),
    });
  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      message: 'Unable to create the order.',
    });
  }
});

// =====================================================
// ADMIN: DASHBOARD STATISTICS
// GET /api/orders/admin/stats
// =====================================================
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      salesResult,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
          },
        },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
    ]);

    return res.status(200).json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalSales: salesResult[0]?.totalSales ?? 0,
      },
      recentOrders: recentOrders.map((order) =>
        formatOrder(order, true)
      ),
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);

    return res.status(500).json({
      message: 'Unable to load dashboard statistics.',
    });
  }
});

// =====================================================
// ADMIN: VIEW ALL CUSTOMERS' ORDERS
// GET /api/orders/admin/all
// =====================================================
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    return res.status(200).json({
      orders: orders.map((order) => formatOrder(order, true)),
    });
  } catch (error) {
    console.error('Admin fetch all orders error:', error);

    return res.status(500).json({
      message: 'Unable to fetch all orders.',
    });
  }
});

// =====================================================
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/admin/:orderId/status
// =====================================================
router.patch(
  '/admin/:orderId/status',
  requireAdmin,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
          message: 'Invalid order ID.',
        });
      }

      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          message: 'Invalid order status.',
          allowedStatuses: ORDER_STATUSES,
        });
      }

      const order = await Order.findById(orderId).populate(
        'user',
        'name email'
      );

      if (!order) {
        return res.status(404).json({
          message: 'Order not found.',
        });
      }

      order.status = status;
      await order.save();

      return res.status(200).json({
        message: 'Order status updated successfully.',
        order: formatOrder(order, true),
      });
    } catch (error) {
      console.error('Admin update order status error:', error);

      return res.status(500).json({
        message: 'Unable to update order status.',
      });
    }
  }
);

// =====================================================
// CUSTOMER: VIEW ONLY THEIR OWN ORDERS
// GET /api/orders
// =====================================================
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      orders: orders.map((order) => formatOrder(order)),
    });
  } catch (error) {
    console.error('Fetch orders error:', error);

    return res.status(500).json({
      message: 'Unable to fetch your orders.',
    });
  }
});

// =====================================================
// CUSTOMER: VIEW ONE OF THEIR OWN ORDERS
// GET /api/orders/:orderId
// =====================================================
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        message: 'Invalid order ID.',
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      order: formatOrder(order),
    });
  } catch (error) {
    console.error('Fetch order error:', error);

    return res.status(500).json({
      message: 'Unable to fetch the order.',
    });
  }
});

export default router;
