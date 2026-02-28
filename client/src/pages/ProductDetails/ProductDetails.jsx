import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './ProductDetails.css';

const initialOrderForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  quantity: 1,
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, submitOrder, isProductsLoading } = useStore();
  const [selectedSizeState, setSelectedSizeState] = useState({ productId: null, size: '' });
  const [selectedImage, setSelectedImage] = useState({ productId: null, image: '' });
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const product = useMemo(() => getProductById(id), [getProductById, id]);
  const productImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.img) return [product.img];
    return [];
  }, [product]);

  if (isProductsLoading) {
    return (
      <section className="details-page details-missing">
        <p className="details-kicker">LOADING</p>
        <h1>Loading product details...</h1>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="details-page details-missing">
        <p className="details-kicker">PRODUCT NOT FOUND</p>
        <h1>This piece is no longer available.</h1>
        <Link to="/" className="details-back-link">
          RETURN TO HOME
        </Link>
      </section>
    );
  }

  const activeImage =
    selectedImage.productId === product.id && selectedImage.image
      ? selectedImage.image
      : productImages[0] || '';
  const availableSizes = product.availableSizes || ['S', 'M', 'L', 'XL'];
  const hasStock = availableSizes.length > 0;
  const selectedSize =
    selectedSizeState.productId === product.id && availableSizes.includes(selectedSizeState.size)
      ? selectedSizeState.size
      : availableSizes[0] || '';
  const lineTotal = product.price * orderForm.quantity;

  const handleOrderFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === 'quantity') {
      const nextQuantity = Math.max(1, Number(value) || 1);
      setOrderForm((prev) => ({ ...prev, quantity: nextQuantity }));
      return;
    }

    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!hasStock || !selectedSize) {
      setSubmitError('This product is currently sold out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await submitOrder(
        {
          fullName: orderForm.fullName,
          email: orderForm.email,
          phone: orderForm.phone,
          location: orderForm.location,
          quantity: orderForm.quantity,
        },
        {
          product,
          size: selectedSize,
          quantity: orderForm.quantity,
        }
      );

      setOrderForm(initialOrderForm);
      navigate('/thank-you', {
        state: {
          orderId: order.id,
          customerName: order.customerName,
        },
      });
    } catch (error) {
      setSubmitError(error?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="details-page">
      <div className="details-grid">
        <div className="details-left">
          <div className="details-main-info">
            <div className="details-media">
              <div className="details-image-wrap">
                <img src={activeImage} alt={product.name} />
              </div>
              <div className="details-thumb-grid">
                {productImages.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    className={`details-thumb ${activeImage === image ? 'active' : ''}`}
                    onClick={() => setSelectedImage({ productId: product.id, image })}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <article className="details-content">
              <p className="details-kicker">CASAWAVE ESSENTIALS</p>
              <h1>{product.name}</h1>
              <p className="details-price">{product.price} MAD</p>
              <p className="details-description">{product.description}</p>

              <div className="details-sizes">
                <p>{hasStock ? 'SELECT SIZE' : 'SOLD OUT'}</p>
                <div className="details-size-grid">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={selectedSize === size ? 'active' : ''}
                      onClick={() => setSelectedSizeState({ productId: product.id, size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>

        <aside className="details-order-col">
          <form className="details-order-form" onSubmit={handleOrderSubmit}>
            <p className="details-form-kicker">ORDER INFO</p>
            <div className="details-form-row">
              <span>Selected Size</span>
              <strong>{selectedSize || '-'}</strong>
            </div>

            <div className="details-form-row details-form-quantity">
              <span>Quantity</span>
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOrderForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1),
                    }))
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={orderForm.quantity}
                  onChange={handleOrderFieldChange}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setOrderForm((prev) => ({
                      ...prev,
                      quantity: prev.quantity + 1,
                    }))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <p className="details-form-total">Total: {lineTotal} MAD</p>

            <input
              type="text"
              name="fullName"
              placeholder="FULL NAME"
              value={orderForm.fullName}
              onChange={handleOrderFieldChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              value={orderForm.email}
              onChange={handleOrderFieldChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="PHONE NUMBER"
              value={orderForm.phone}
              onChange={handleOrderFieldChange}
              required
            />
            <textarea
              name="location"
              placeholder="CITY / ADDRESS"
              rows="3"
              value={orderForm.location}
              onChange={handleOrderFieldChange}
              required
            />

            {submitError ? <span className="details-form-error">{submitError}</span> : null}

            <button className="details-order-btn" type="submit" disabled={!hasStock || isSubmitting}>
              {isSubmitting ? 'PROCESSING...' : hasStock ? 'ADD TO CART' : 'SOLD OUT'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}

export default ProductDetails;
