import 'dotenv/config';

import dns from 'node:dns';
import mongoose from 'mongoose';

import products from '../frontend/src/data/products.js';
import Product from './src/models/Product.js';

// Fix DNS resolution for MongoDB Atlas.
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
]);

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB Atlas');

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No products found in the frontend data file.');
    }

    // Prevent accidental duplicate imports.
    const existingCount = await Product.countDocuments();

    if (existingCount > 0) {
      console.log(
        `${existingCount} products already exist. Import cancelled to prevent duplicates.`
      );
      return;
    }

    const formattedProducts = products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      sizes: product.sizes,
      stock: 0,
      isActive: true,
    }));

    const insertedProducts = await Product.insertMany(
      formattedProducts
    );

    console.log(
      `Successfully imported ${insertedProducts.length} products!`
    );
  } catch (error) {
    console.error('Product import failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProducts();