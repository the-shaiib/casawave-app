import { Link, useLocation } from 'react-router-dom';
import './ThankYou.css';

function ThankYou() {
  const location = useLocation();
  const customerName = location.state?.customerName || 'Customer';
  const orderId = location.state?.orderId || 'N/A';

  return (
    <section className="thank-you-page">
      <div className="thank-you-card">
        <p>ORDER CONFIRMED</p>
        <h1>Thank You, {customerName}</h1>
        <span>Your order #{orderId} was received successfully.</span>
        <Link to="/">CONTINUE SHOPPING</Link>
      </div>
    </section>
  );
}

export default ThankYou;
