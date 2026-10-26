
import { Router } from 'express';
import mongoose from 'mongoose';

import Product from '../models/Product.js';

import {
  authenticateUser,
  requireAdmin,
} from '../middleware/authMiddleware.js';

const router = Router();

const allowedFields = [
  'name',
  'description',
  'price',
  'originalPrice',
  'image',
  'category',
  'sizes',
  'stock',
  'isActive',
];

function validateProductInput(body, partial = false) {
  const has = (key) =>
    Object.prototype.hasOwnProperty.call(body, key);

  const errors = [];

  if (!partial) {
    for (const field of [
      'name',
      'description',
      'price',
      'image',
      'category',
    ]) {
      if (!has(field)) {
        errors.push(`${field} is required.`);
      }
    }
  }

  for (const field of [
    'name',
    'description',
    'image',
    'category',
  ]) {
    if (
      has(field) &&
      (
        typeof body[field] !== 'string' ||
        !body[field].trim()
      )
    ) {
      errors.push(
        `${field} must be a non-empty string.`
      );
    }
  }

  for (const field of [
    'price',
    'originalPrice',
    'stock',
  ]) {
    if (has(field)) {
      const value = body[field];

      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        errors.push(
          `${field} must be a non-negative number.`
        );
      }
    }
  }

  if (
    has('sizes') &&
    (
      !Array.isArray(body.sizes) ||
      !body.sizes.every(
        (size) =>
          typeof size === 'string' &&
          size.trim().length > 0
      )
    )
  ) {
    errors.push(
      'Sizes must be an array of non-empty strings.'
    );
  }

  if (
    has('isActive') &&
    typeof body.isActive !== 'boolean'
  ) {
    errors.push('isActive must be true or false.');
  }

  return errors;
}

function pickProductFields(body) {
  const product = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      product[field] = body[field];
    }
  }

  for (const field of [
    'name',
    'description',
    'image',
    'category',
  ]) {
    if (typeof product[field] === 'string') {
      product[field] = product[field].trim();
    }
  }

  if (Array.isArray(product.sizes)) {
    product.sizes = product.sizes.map(
      (size) => size.trim()
    );
  }

  return product;
}

// GET ALL ACTIVE PRODUCTS — public
router.get('/', async (req, res) => {
  const startedAt = Date.now();

  console.log('\n[Products] Request received');
  console.log(
    '[Products] MongoDB readyState:',
    mongoose.connection.readyState
  );

  try {
    const queryStartedAt = Date.now();

    const products = await Product.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .maxTimeMS(10000)
      .lean();

    console.log(
      `[Products] Database query took ${
        Date.now() - queryStartedAt
      } ms`
    );

    console.log(
      `[Products] Products returned: ${products.length}`
    );

    console.log(
      `[Products] Total request took ${
        Date.now() - startedAt
      } ms`
    );

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      '[Products] Request failed:',
      error.message
    );

    console.log(
      `[Products] Failed after ${
        Date.now() - startedAt
      } ms`
    );

    return res.status(500).json({
      message: 'Unable to fetch products.',
    });
  }
});

// GET ONE ACTIVE PRODUCT — public
router.get('/:id', async (req, res) => {
  const startedAt = Date.now();

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid product ID.',
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).lean();

    console.log(
      `[Products] Single product request took ${
        Date.now() - startedAt
      } ms`
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(
      '[Products] Get product error:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to fetch product.',
    });
  }
});

// CREATE PRODUCT — admin only
router.post(
  '/',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const errors = validateProductInput(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Invalid product data.',
          errors,
        });
      }

      const productData = pickProductFields(
        req.body
      );

      const product = await Product.create(
        productData
      );

      return res.status(201).json({
        message: 'Product created successfully.',
        product,
      });
    } catch (error) {
      console.error(
        'Create product error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to create product.',
      });
    }
  }
);

// UPDATE PRODUCT — admin only
router.put(
  '/:id',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid product ID.',
        });
      }

      const errors = validateProductInput(
        req.body,
        true
      );

      if (errors.length > 0) {
        return res.status(400).json({
          message: 'Invalid product data.',
          errors,
        });
      }

      const productData = pickProductFields(
        req.body
      );

      if (
        Object.keys(productData).length === 0
      ) {
        return res.status(400).json({
          message:
            'Provide at least one field to update.',
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          id,
          { $set: productData },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found.',
        });
      }

      return res.status(200).json({
        message: 'Product updated successfully.',
        product,
      });
    } catch (error) {
      console.error(
        'Update product error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to update product.',
      });
    }
  }
);

// DEACTIVATE PRODUCT — admin only
router.delete(
  '/:id',
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid product ID.',
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          id,
          { $set: { isActive: false } },
          { new: true }
        );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found.',
        });
      }

      return res.status(200).json({
        message: 'Product deactivated successfully.',
        product,
      });
    } catch (error) {
      console.error(
        'Delete product error:',
        error.message
      );

      return res.status(500).json({
        message: 'Unable to deactivate product.',
      });
    }
  }
);

export default router;
