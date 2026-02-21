import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './CheckoutModal.css';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  quantity: 1,
};

function CheckoutModal() {
  const navigate = useNavigate();
  const { checkoutState, closeCheckout, submitOrder } = useStore();
  const [form, setForm] = useState(initialForm);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!checkoutState.open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [checkoutState.open]);

  if (!checkoutState.open || !checkoutState.product) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'quantity') {
      const nextQuantity = Math.max(1, Number(value) || 1);
      setForm((prev) => ({ ...prev, quantity: nextQuantity }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    try {
      const order = await submitOrder(form);

      navigate('/thank-you', {
        state: {
          orderId: order.id,
          customerName: order.customerName,
        },
      });
      setForm(initialForm);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error.message || 'Failed to place order.');
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setSubmitError('');
    closeCheckout();
  };

  const productImages = checkoutState.product.images || [checkoutState.product.img];
  const previewImage = productImages[0];
  const lineTotal = checkoutState.product.price * form.quantity;

  return (
    <div className="checkout-layer" onClick={handleClose}>
      <aside
        className="checkout-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="checkout-close"
          type="button"
          onClick={handleClose}
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <p className="checkout-kicker">SECURE CHECKOUT</p>
        <h2>Complete Your Order</h2>

        <div className="checkout-product">
          <img src={previewImage} alt={checkoutState.product.name} />
          <div>
            <span>{checkoutState.product.name}</span>
            <span>{checkoutState.product.price} MAD / unit</span>
          </div>
        </div>

        <p className="checkout-size">
          Selected Size: {checkoutState.size}
        </p>

        <div className="checkout-quantity">
          <p>Quantity</p>
          <div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
            >
              -
            </button>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }))}
            >
              +
            </button>
          </div>
        </div>

        <p className="checkout-total">Total: {lineTotal} MAD</p>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="FULL NAME"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="PHONE NUMBER"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="location"
            placeholder="CITY / ADDRESS"
            rows="2"
            value={form.location}
            onChange={handleChange}
            required
          />

          {submitError ? <span>{submitError}</span> : null}

          <button type="submit">CONFIRM ORDER</button>
        </form>
      </aside>
    </div>
  );
}

export default CheckoutModal;
