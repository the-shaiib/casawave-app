const Order = require('../models/Order');

const normalizeQuantity = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      location,
      productName,
      productId,
      productImage,
      size,
      quantity,
      unitPrice,
    } = req.body;

    if (
      !customerName ||
      !email ||
      !phone ||
      !location ||
      !productName ||
      !productImage ||
      !size ||
      quantity === undefined ||
      unitPrice === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required order fields.',
      });
    }

    const normalizedQuantity = normalizeQuantity(quantity);
    const normalizedUnitPrice = Number(unitPrice);

    if (!Number.isFinite(normalizedUnitPrice) || normalizedUnitPrice < 0) {
      return res.status(400).json({ message: 'Invalid unitPrice.' });
    }

    const order = await Order.create({
      customerName,
      email,
      phone,
      location,
      productName,
      productId: productId ? String(productId) : null,
      productImage,
      size,
      quantity: normalizedQuantity,
      unitPrice: normalizedUnitPrice,
      lineTotal: normalizedUnitPrice * normalizedQuantity,
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const email = String(req.query?.email || '').trim().toLowerCase();
    const phone = String(req.query?.phone || '').replace(/\D/g, '');

    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone are required.' });
    }

    const allByEmail = await Order.find({ email }).sort({ createdAt: -1 });
    const orders = allByEmail.filter(
      (order) => String(order.phone || '').replace(/\D/g, '') === phone
    );

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedStatus = ['Pending', 'Confirmed', 'Cancelled'];
    const updates = {};
    const {
      customerName,
      phone,
      location,
      size,
      status,
    } = req.body;

    if (customerName !== undefined) updates.customerName = customerName;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (size !== undefined) updates.size = size;
    if (status !== undefined) {
      if (!allowedStatus.includes(String(status))) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getCustomerOrders,
  deleteOrder,
  updateOrder,
};
