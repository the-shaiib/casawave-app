const express = require('express');
const {
  createOrder,
  getOrders,
  getCustomerOrders,
  deleteOrder,
  updateOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createOrder);
router.get('/customer', getCustomerOrders);
router.get('/', authMiddleware, getOrders);
router.delete('/:id', authMiddleware, deleteOrder);
router.patch('/:id', authMiddleware, updateOrder);

module.exports = router;
