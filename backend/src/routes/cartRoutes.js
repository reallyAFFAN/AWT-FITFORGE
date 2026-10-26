
import { Router } from 'express';
import mongoose from 'mongoose';

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateUser);

function formatCart(cart) {
  return {
    items: (cart?.items ?? [])
      .filter((item) => item.product)
      .map((item) => {
        const product = item.product;

        return {
          ...product.toObject(),
          id: String(product._id),
          _id: String(product._id),
          size: item.size,
          quantity: item.quantity,
        };
      }),
  };
}

// Get the current user's cart.
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.userId,
    }).populate('items.product');

    return res.json({
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Get cart error:', error);

    return res.status(500).json({
      message: 'Unable to load your cart.',
    });
  }
});

// Replace the current user's cart.
router.put('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Cart items must be an array.',
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        message: 'Your cart contains too many different items.',
      });
    }

    const normalizedItems = new Map();

    for (const item of items) {
      const productId = String(
        item.productId ?? item.id ?? item._id ?? ''
      );

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
          message: 'One or more cart items are invalid.',
        });
      }

      const key = `${productId}:${size}`;
      const previous = normalizedItems.get(key);
      const combinedQuantity = (previous?.quantity ?? 0) + quantity;

      if (combinedQuantity > 100) {
        return res.status(400).json({
          message: 'An item quantity cannot exceed 100.',
        });
      }

      normalizedItems.set(key, {
        product: productId,
        size,
        quantity: combinedQuantity,
      });
    }

    const cleanItems = [...normalizedItems.values()];
    const productIds = [...new Set(
      cleanItems.map((item) => item.product)
    )];

    const products = productIds.length
      ? await Product.find({
          _id: { $in: productIds },
          isActive: true,
        })
      : [];

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    for (const item of cleanItems) {
      const product = productMap.get(item.product);

      if (!product) {
        return res.status(400).json({
          message: 'A product in your cart is unavailable.',
        });
      }

      if (
        Array.isArray(product.sizes) &&
        product.sizes.length > 0 &&
        !product.sizes.includes(item.size)
      ) {
        return res.status(400).json({
          message: `Size "${item.size}" is unavailable for ${product.name}.`,
        });
      }
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      {
        $set: {
          user: req.userId,
          items: cleanItems,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate('items.product');

    return res.json({
      message: 'Cart saved successfully.',
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Save cart error:', error);

    return res.status(500).json({
      message: 'Unable to save your cart.',
    });
  }
});

// Clear only the authenticated user's cart.
router.delete('/', async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { $set: { items: [] } },
      { upsert: true, new: true }
    );

    return res.json({
      message: 'Cart cleared successfully.',
      cart: { items: [] },
    });
  } catch (error) {
    console.error('Clear cart error:', error);

    return res.status(500).json({
      message: 'Unable to clear your cart.',
    });
  }
});

export default router;
