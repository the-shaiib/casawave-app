import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { API_BASE_URL, API_TARGET_LABEL, notifyUser, parseApiError } from '../../config/api';
import './Admin.css';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORY_OPTIONS = ['Hoodies', 'T-shirts', 'Pants', 'Ensemble'];
const ADMIN_TOKEN_KEY = 'casawave_token';

const initialProductForm = {
  name: '',
  price: '',
  category: 'Hoodies',
  description: '',
  mainImage: null,
  galleryImages: [],
  availableSizes: ['M'],
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const toWhatsAppNumber = (phone) => String(phone || '').replace(/\D/g, '');
const revokeObjectUrls = (urls = []) => {
  urls.forEach((url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  });
};

function Admin() {
  const navigate = useNavigate();
  const {
    orders,
    isOrdersLoading,
    products,
    isProductsLoading,
    addProduct,
    removeProduct,
    cancelOrder,
    adminLogout,
  } = useStore();
  const [productForm, setProductForm] = useState(initialProductForm);
  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isLogoutConfirming, setIsLogoutConfirming] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const adminToken =
    typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : '';

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate, adminToken]);

  useEffect(
    () => () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
    },
    [mainImagePreview]
  );

  useEffect(
    () => () => {
      revokeObjectUrls(galleryPreviews);
    },
    [galleryPreviews]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleProductFormSize = (size) => {
    setProductForm((prev) => {
      const exists = prev.availableSizes.includes(size);
      return {
        ...prev,
        availableSizes: exists
          ? prev.availableSizes.filter((item) => item !== size)
          : [...prev.availableSizes, size],
      };
    });
  };

  const handleMainImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProductForm((prev) => ({ ...prev, mainImage: file }));
    setMainImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const handleGalleryImagesChange = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    setProductForm((prev) => ({ ...prev, galleryImages: files }));
    setGalleryPreviews((prev) => {
      revokeObjectUrls(prev);
      return files.map((file) => URL.createObjectURL(file));
    });
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    if (!productForm.mainImage) return;
    if (productForm.availableSizes.length === 0) {
      setFormError('Select at least one size.');
      return;
    }

    setFormError('');

    try {
      const mainImage = await fileToDataUrl(productForm.mainImage);
      const additionalImages = await Promise.all(
        productForm.galleryImages.map((file) => fileToDataUrl(file))
      );

      await addProduct({
        name: productForm.name,
        price: productForm.price,
        category: productForm.category,
        description: productForm.description,
        image: mainImage,
        additionalImages,
        availableSizes: productForm.availableSizes,
      });

      setProductForm(initialProductForm);
      setMainImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return '';
      });
      setGalleryPreviews((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
      setFormKey((prev) => prev + 1);
    } catch (error) {
      const message = parseApiError(error, 'Failed to add product.');
      setFormError(message);
      notifyUser(message);
    }
  };

  const getAuthConfig = () => {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Admin token missing. Please login again.');
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleConfirmArchive = async (orderId) => {
    if (!orderId) {
      setOrderError('Invalid order id.');
      return;
    }

    setOrderError('');

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/orders/${orderId}`, getAuthConfig());

      if (response.status >= 200 && response.status < 300) {
        cancelOrder(orderId);
        setPendingArchiveId(null);
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        // Order already removed in DB; keep UI consistent.
        cancelOrder(orderId);
        setPendingArchiveId(null);
        return;
      }

      const message = parseApiError(error, 'Failed to archive order.');
      setOrderError(message);
      notifyUser(message);
    }
  };

  const handleConfirmRemove = async (productId) => {
    try {
      await removeProduct(productId);
      setPendingRemoveId(null);
    } catch (error) {
      const message = parseApiError(error, 'Failed to remove product.');
      setFormError(message);
      notifyUser(message);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin-login', { replace: true });
  };

  if (!adminToken) {
    return null;
  }

  return (
    <section className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>COMMAND</h2>
          <a href="#orders">Orders</a>
          <a href="#inventory">Inventory</a>
          <button type="button" onClick={() => setIsLogoutConfirming(true)}>
            Logout
          </button>
          {isLogoutConfirming ? (
            <div className="admin-inline-confirm admin-logout-confirm">
              <button type="button" onClick={handleLogout}>
                <i className="fa-solid fa-check" /> Yes
              </button>
              <button type="button" onClick={() => setIsLogoutConfirming(false)}>
                <i className="fa-solid fa-xmark" /> Cancel
              </button>
            </div>
          ) : null}
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <p>CASAWAVE CONTROL ROOM</p>
            <h1>Dashboard</h1>
            <span className="admin-data-source">Data source: {API_TARGET_LABEL}</span>
          </header>

          <section id="orders" className="admin-card">
            <div className="admin-section-head">
              <h3>Order Management</h3>
              <span>{orders.length} Orders</span>
            </div>

            {isOrdersLoading && orders.length === 0 ? (
              <p className="admin-empty">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="admin-empty">No pending orders.</p>
            ) : (
              <div className="admin-orders-cards admin-orders-cards-full">
                {orders.map((order) => {
                  const orderId = order._id || order.id;
                  const waNumber = toWhatsAppNumber(order.phone);

                  return (
                    <article key={orderId} className="admin-order-card">
                      <div className="admin-order-card-top">
                        <img
                          className="admin-order-image"
                          src={order.productImage}
                          alt={order.productName}
                        />
                        <div className="admin-order-primary">
                          <p className="admin-order-title">{order.productName}</p>
                        </div>
                        <strong>{order.lineTotal} MAD</strong>
                      </div>

                      <div className="admin-order-meta">
                        <p><strong>Size:</strong> {order.size}</p>
                        <p><strong>Quantity:</strong> {order.quantity}</p>
                        <p><strong>Customer:</strong> {order.customerName}</p>
                        <p>
                          <strong>Phone:</strong> {order.phone}
                          {waNumber ? (
                            <a
                              className="admin-wa-link"
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open WhatsApp"
                            >
                              <i className="fa-brands fa-whatsapp" />
                            </a>
                          ) : null}
                        </p>
                        <p><strong>Location:</strong> {order.location}</p>
                        <p><strong>Status:</strong> {order.status || 'Pending'}</p>
                      </div>

                      <button
                        type="button"
                        className="admin-order-archive-btn"
                        onClick={() => setPendingArchiveId(orderId)}
                      >
                        Confirm & Archive
                      </button>
                      {pendingArchiveId === orderId ? (
                        <div className="admin-inline-confirm">
                          <button
                            type="button"
                            onClick={() => handleConfirmArchive(orderId)}
                          >
                            <i className="fa-solid fa-check" /> Yes
                          </button>
                          <button type="button" onClick={() => setPendingArchiveId(null)}>
                            <i className="fa-solid fa-xmark" /> Cancel
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
            {orderError ? <p className="admin-form-error">{orderError}</p> : null}
          </section>

          <section id="inventory" className="admin-card">
            <div className="admin-section-head">
              <h3>Inventory Management</h3>
              <span>{products.length} Products</span>
            </div>

            <form key={formKey} className="admin-product-form" onSubmit={handleAddProduct}>
              <input
                type="text"
                name="name"
                placeholder="PRODUCT NAME"
                value={productForm.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="PRICE MAD"
                value={productForm.price}
                onChange={handleChange}
                required
              />
              <select name="category" value={productForm.category} onChange={handleChange} required>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                placeholder="DESCRIPTION"
                value={productForm.description}
                onChange={handleChange}
                required
              />

              <label className="admin-upload-card">
                <input
                  className="admin-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  required
                />
                {mainImagePreview ? (
                  <>
                    <img
                      className="admin-upload-preview"
                      src={mainImagePreview}
                      alt="Main preview"
                    />
                    <div className="admin-upload-meta">
                      <span>Main image ready</span>
                      <small>{productForm.mainImage?.name || '1 file selected'}</small>
                    </div>
                  </>
                ) : (
                  <div className="admin-upload-empty">
                    <i className="fa-solid fa-cloud-arrow-up" />
                    <span>Upload main image</span>
                    <small>Click to choose file</small>
                  </div>
                )}
              </label>

              <label className="admin-upload-card admin-upload-card-gallery">
                <input
                  className="admin-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesChange}
                />
                {galleryPreviews.length > 0 ? (
                  <>
                    <div className="admin-upload-gallery-grid">
                      {galleryPreviews.map((previewUrl, index) => (
                        <img
                          key={`gallery-preview-${index}`}
                          className="admin-upload-gallery-thumb"
                          src={previewUrl}
                          alt={`Gallery preview ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="admin-upload-meta">
                      <span>Additional images</span>
                      <small>{galleryPreviews.length} file(s) selected</small>
                    </div>
                  </>
                ) : (
                  <div className="admin-upload-empty">
                    <i className="fa-regular fa-images" />
                    <span>Upload additional images</span>
                    <small>Up to 4 files</small>
                  </div>
                )}
              </label>

              <div className="admin-size-field">
                <p>Available Sizes</p>
                <div className="admin-size-options">
                  {SIZE_OPTIONS.map((size) => (
                    <label key={`new-${size}`}>
                      <input
                        type="checkbox"
                        checked={productForm.availableSizes.includes(size)}
                        onChange={() => toggleProductFormSize(size)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
                {formError ? <span className="admin-form-error">{formError}</span> : null}
              </div>

              <button type="submit">ADD PRODUCT</button>
            </form>

            {isProductsLoading ? (
              <p className="admin-empty">Loading products...</p>
            ) : (
              <div className="admin-products-list">
                {products.map((product) => {
                  const productSizes = product.availableSizes || ['S', 'M', 'L', 'XL'];
                  const isSoldOut = productSizes.length === 0;
                  const productId = product._id || product.id;

                  return (
                    <article key={productId} className="admin-product-row">
                      <img
                        className="admin-product-image"
                        src={product.images?.[0] || product.img}
                        alt={product.name}
                      />

                      <div className="admin-product-main">
                        <p>{product.name}</p>
                        <span>{product.price} MAD</span>
                        <div className="admin-size-badges">
                          {isSoldOut ? (
                            <span className="admin-size-badge sold-out">SOLD OUT</span>
                          ) : (
                            productSizes.map((size) => (
                              <span key={`${productId}-${size}`} className="admin-size-badge">
                                {size}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="admin-product-actions">
                        <button type="button" onClick={() => setPendingRemoveId(productId)}>
                          Remove
                        </button>
                      </div>
                      {pendingRemoveId === productId ? (
                        <div className="admin-inline-confirm admin-remove-confirm">
                          <button
                            type="button"
                            onClick={() => handleConfirmRemove(productId)}
                          >
                            <i className="fa-solid fa-check" /> Yes
                          </button>
                          <button type="button" onClick={() => setPendingRemoveId(null)}>
                            <i className="fa-solid fa-xmark" /> Cancel
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

export default Admin;
