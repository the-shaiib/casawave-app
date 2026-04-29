const Product = require('../models/Product');
const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['Hoodies', 'T-shirts', 'Pants', 'Ensemble'];
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const normalizeSizes = (sizes) => {
  if (!Array.isArray(sizes)) return [...DEFAULT_SIZES];

  const normalized = sizes
    .map((size) => String(size || '').trim().toUpperCase())
    .filter(Boolean);
  const unique = [...new Set(normalized)];

  if (unique.length === 0) return [...DEFAULT_SIZES];
  return unique;
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('name price category image additionalImages description availableSizes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=120');
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      image,
      additionalImages,
      description,
      availableSizes,
    } = req.body;

    if (!name || price === undefined || !category || !image || !description) {
      return res.status(400).json({
        message: 'name, price, category, image, and description are required.',
      });
    }

    const normalizedCategory = String(category).trim();
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({
        message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`,
      });
    }

    const normalizedAdditionalImages = Array.isArray(additionalImages)
      ? additionalImages.filter((item) => typeof item === 'string' && item.trim())
      : [];
    const normalizedSizes = normalizeSizes(availableSizes);

    const product = await Product.create({
      name,
      price: Number(price),
      category: normalizedCategory,
      image,
      additionalImages: normalizedAdditionalImages,
      description,
      availableSizes: normalizedSizes,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = {
  getProducts,
  addProduct,
  deleteProduct,
};
