const express = require('express');
const { getProducts, addProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', authMiddleware, addProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
