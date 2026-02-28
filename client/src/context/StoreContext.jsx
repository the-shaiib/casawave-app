/* eslint-disable react-refresh/only-export-components */
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import hoodieImg from '../assets/pr.png';
import {
  API_BASE_URL,
  DEFAULT_SERVER_ERROR_MESSAGE,
  notifyUser,
  parseApiError,
} from '../config/api';

const StoreContext = createContext(null);
const ADMIN_TOKEN_KEY = 'casawave_token';
const USER_ORDERS_KEY = 'casawave_user_orders';
const USER_PROFILE_KEY = 'casawave_customer_profile';
const MAX_IMAGE_PAYLOAD_BYTES = 50 * 1024 * 1024;
const ORDER_SYNC_INTERVAL_MS = 4000;
const DEFAULT_PRODUCT_SIZES = ['S', 'M', 'L', 'XL'];

const normalizeQuantity = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
};

const normalizeSizeList = (sizes, fallback = DEFAULT_PRODUCT_SIZES) => {
  if (!Array.isArray(sizes)) return [...fallback];

  const normalized = sizes
    .map((size) => String(size || '').trim().toUpperCase())
    .filter(Boolean);
  const unique = [...new Set(normalized)];

  if (unique.length === 0) return [...fallback];
  return unique;
};

const resolveProductImages = (product) => {
  if (Array.isArray(product?.images)) {
    const validImages = product.images.filter(Boolean);
    if (validImages.length > 0) return validImages;
  }
  if (product?.img) return [product.img];
  return [hoodieImg];
};

const mapApiProductToUi = (product) => {
  const image = product?.image || hoodieImg;
  const extraImages = Array.isArray(product?.additionalImages)
    ? product.additionalImages.filter(Boolean)
    : [];

  return {
    _id: product?._id || product?.id,
    id: product?._id || product?.id,
    name: product?.name || 'Unnamed product',
    price: Number(product?.price || 0),
    description: product?.description || '',
    category: product?.category || '',
    img: image,
    images: [image, ...extraImages],
    availableSizes: normalizeSizeList(product?.availableSizes),
  };
};

const mapApiOrderToUi = (order) => ({
  ...order,
  _id: order?._id || order?.id,
  id: order?._id || order?.id,
  customerName: order?.customerName || '',
  email: order?.email || '',
  phone: order?.phone || '',
  location: order?.location || '',
  productName: order?.productName || 'Unknown product',
  productId: order?.productId || null,
  productImage: order?.productImage || hoodieImg,
  size: order?.size || 'M',
  quantity: Number(order?.quantity || 1),
  unitPrice: Number(order?.unitPrice || 0),
  lineTotal: Number(order?.lineTotal || 0),
  status: order?.status || 'Pending',
  createdAt: order?.createdAt || new Date().toISOString(),
});

const isLikelyBase64Image = (value) =>
  typeof value === 'string' &&
  (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://'));

function getStoredAdminAuth() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY));
}

function getStoredAdminToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function getStoredUserOrders() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(USER_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read user orders:', error.message);
    return [];
  }
}

function getStoredUserProfile() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    const email = String(parsed?.email || '').trim().toLowerCase();
    const phone = String(parsed?.phone || '').replace(/\D/g, '');
    if (!email || !phone) return null;

    return {
      customerName: String(parsed?.customerName || '').trim(),
      email,
      phone,
    };
  } catch (error) {
    console.error('Failed to read customer profile:', error.message);
    return null;
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [userOrders, setUserOrders] = useState(() => getStoredUserOrders().map(mapApiOrderToUi));
  const [isUserOrdersLoading, setIsUserOrdersLoading] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(getStoredUserProfile);
  const [checkoutState, setCheckoutState] = useState({
    open: false,
    product: null,
    size: 'M',
    quantity: 1,
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(getStoredAdminAuth);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        const mappedProducts = Array.isArray(response.data)
          ? response.data.map(mapApiProductToUi)
          : [];
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error.message);
        setProducts([]);
        notifyUser(parseApiError(error, DEFAULT_SERVER_ERROR_MESSAGE));
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      setIsOrdersLoading(false);
      return;
    }

    let active = true;
    let hasFinishedInitialFetch = false;

    const fetchOrders = async () => {
      const token = getStoredAdminToken();
      if (!token) return;

      if (active && !hasFinishedInitialFetch) {
        setIsOrdersLoading(true);
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mappedOrders = Array.isArray(response.data)
          ? response.data.map(mapApiOrderToUi)
          : [];

        if (active) {
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error.message);
        notifyUser(parseApiError(error, DEFAULT_SERVER_ERROR_MESSAGE));
      } finally {
        if (active && !hasFinishedInitialFetch) {
          setIsOrdersLoading(false);
          hasFinishedInitialFetch = true;
        }
      }
    };

    fetchOrders();
    const intervalId = window.setInterval(fetchOrders, ORDER_SYNC_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(userOrders));
  }, [userOrders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!customerProfile) {
      window.localStorage.removeItem(USER_PROFILE_KEY);
      return;
    }

    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(customerProfile));
  }, [customerProfile]);

  useEffect(() => {
    if (!customerProfile?.email || !customerProfile?.phone) {
      setIsUserOrdersLoading(false);
      return;
    }

    let active = true;
    let hasFinishedInitialFetch = false;

    const fetchCustomerOrders = async () => {
      if (active && !hasFinishedInitialFetch) {
        setIsUserOrdersLoading(true);
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/orders/customer`, {
          params: {
            email: customerProfile.email,
            phone: customerProfile.phone,
          },
        });

        const mappedOrders = Array.isArray(response.data)
          ? response.data.map(mapApiOrderToUi)
          : [];

        if (active) {
          setUserOrders(mappedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch customer orders:', error.message);
        notifyUser(parseApiError(error, DEFAULT_SERVER_ERROR_MESSAGE));
      } finally {
        if (active && !hasFinishedInitialFetch) {
          setIsUserOrdersLoading(false);
          hasFinishedInitialFetch = true;
        }
      }
    };

    fetchCustomerOrders();
    const intervalId = window.setInterval(fetchCustomerOrders, ORDER_SYNC_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [customerProfile]);

  const openCheckout = (product, size, quantity = 1) => {
    setCheckoutState({
      open: true,
      product,
      size,
      quantity: normalizeQuantity(quantity),
    });
  };

  const closeCheckout = () => {
    setCheckoutState({ open: false, product: null, size: 'M', quantity: 1 });
  };

  const submitOrder = async (checkoutForm) => {
    const quantity = normalizeQuantity(checkoutForm.quantity ?? checkoutState.quantity);
    const unitPrice = checkoutState.product?.price || 0;
    const productImages = resolveProductImages(checkoutState.product);

    const payload = {
      customerName: checkoutForm.fullName,
      email: checkoutForm.email,
      phone: checkoutForm.phone,
      location: checkoutForm.location,
      productName: checkoutState.product?.name || 'Unknown product',
      productId: checkoutState.product?.id || null,
      productImage: productImages[0],
      size: checkoutState.size,
      quantity,
      unitPrice,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders`, payload);
      const order = mapApiOrderToUi(response.data);

      setCustomerProfile({
        customerName: String(checkoutForm.fullName || '').trim(),
        email: String(checkoutForm.email || '').trim().toLowerCase(),
        phone: String(checkoutForm.phone || '').replace(/\D/g, ''),
      });
      setUserOrders((prev) => [order, ...prev]);
      closeCheckout();

      return order;
    } catch (error) {
      const message = parseApiError(error, DEFAULT_SERVER_ERROR_MESSAGE);
      notifyUser(message);
      throw new Error(message);
    }
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) =>
      prev.filter((order) => String(order._id || order.id) !== String(orderId))
    );
    setUserOrders((prev) =>
      prev.filter((order) => String(order._id || order.id) !== String(orderId))
    );
  };

  const updateOrderQuantity = (orderId, quantity) => {
    const nextQuantity = normalizeQuantity(quantity);
    setOrders((prev) =>
      prev.map((order) => {
        if (String(order._id) !== String(orderId)) return order;
        return {
          ...order,
          quantity: nextQuantity,
          lineTotal: order.unitPrice * nextQuantity,
        };
      })
    );
  };

  const updateOrderDetails = (orderId, updates) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (String(order._id) !== String(orderId)) return order;
        return {
          ...order,
          customerName: updates.customerName ?? order.customerName,
          phone: updates.phone ?? order.phone,
          location: updates.location ?? order.location,
          size: updates.size ?? order.size,
          status: updates.status ?? order.status ?? 'Pending',
        };
      })
    );
  };

  const addProduct = async (newProduct) => {
    const token = getStoredAdminToken();

    if (!token) {
      throw new Error('Admin token is missing. Please login again.');
    }

    const image = Array.isArray(newProduct.images) ? newProduct.images[0] : newProduct.image;
    const additionalImages = Array.isArray(newProduct.additionalImages)
      ? newProduct.additionalImages.filter(Boolean)
      : [];

    if (!isLikelyBase64Image(image)) {
      throw new Error('Invalid image format. Please upload a valid image.');
    }

    if (typeof image === 'string' && image.length > MAX_IMAGE_PAYLOAD_BYTES) {
      throw new Error('Image is too large. Please use a smaller image.');
    }

    additionalImages.forEach((img) => {
      if (!isLikelyBase64Image(img)) {
        throw new Error('Invalid additional image format.');
      }
      if (typeof img === 'string' && img.length > MAX_IMAGE_PAYLOAD_BYTES) {
        throw new Error('One additional image is too large.');
      }
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products`,
        {
          name: newProduct.name,
          price: Number(newProduct.price),
          category: newProduct.category,
          image,
          additionalImages,
          description: newProduct.description,
          availableSizes: normalizeSizeList(newProduct.availableSizes, []),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseProduct = response?.data || {};
      const mapped = mapApiProductToUi({
        ...responseProduct,
        availableSizes: Array.isArray(responseProduct.availableSizes)
          ? responseProduct.availableSizes
          : normalizeSizeList(newProduct.availableSizes),
      });
      setProducts((prev) => [mapped, ...prev]);

      return mapped;
    } catch (error) {
      if (error?.response?.status === 413) {
        const message = 'Image payload too large. Please upload a smaller image.';
        notifyUser(message);
        throw new Error(message);
      }
      const message = parseApiError(error, 'Failed to add product.');
      notifyUser(message);
      throw new Error(message);
    }
  };

  const removeProduct = async (productId) => {
    const token = getStoredAdminToken();
    if (!token) {
      throw new Error('Admin token is missing. Please login again.');
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setProducts((prev) => prev.filter((item) => String(item.id) !== String(productId)));
        return true;
      }

      throw new Error('Failed to delete product.');
    } catch (error) {
      const message = parseApiError(error, 'Failed to delete product.');
      notifyUser(message);
      throw new Error(message);
    }
  };

  const getProductById = (id) => products.find((item) => String(item.id) === String(id));

  const adminLogin = async (passcode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/verify`, { passcode });

      if (!response.data?.token) {
        return {
          success: false,
          message: 'Invalid passcode.',
        };
      }

      setIsAdminAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
        window.localStorage.removeItem('casawave-admin-auth');
      }

      return { success: true };
    } catch (error) {
      const message = parseApiError(error, 'Unable to reach backend server.');
      notifyUser(message);
      return {
        success: false,
        message,
      };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setOrders([]);
    setIsOrdersLoading(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem('casawave-admin-auth');
    }
  };

  const cartCount = userOrders.length;

  const value = {
    products,
    isProductsLoading,
    orders,
    isOrdersLoading,
    userOrders,
    isUserOrdersLoading,
    cartCount,
    checkoutState,
    isAdminAuthenticated,
    openCheckout,
    closeCheckout,
    submitOrder,
    cancelOrder,
    updateOrderQuantity,
    updateOrderDetails,
    addProduct,
    removeProduct,
    getProductById,
    adminLogin,
    adminLogout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
}
