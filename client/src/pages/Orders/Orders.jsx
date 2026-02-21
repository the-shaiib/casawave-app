import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './Orders.css';

function Orders() {
  const { userOrders, isUserOrdersLoading } = useStore();

  return (
    <section className="orders-page">
      <div className="orders-wrap">
        <header className="orders-header">
          <p>ORDER STATUS</p>
          <h1>My Orders</h1>
        </header>

        {isUserOrdersLoading ? (
          <p className="orders-empty-text">Loading orders...</p>
        ) : userOrders.length === 0 ? (
          <div className="orders-empty">
            <h2>Order submitted. Our team will contact you for confirmation.</h2>
            <Link to="/">CONTINUE SHOPPING</Link>
          </div>
        ) : (
          <div className="orders-list">
            {userOrders.map((order) => (
              <article key={order._id || order.id} className="order-item">
                <img src={order.productImage} alt={order.productName} />
                <div className="order-item-main">
                  <p>{order.productName}</p>
                  <span>Qty: {order.quantity}</span>
                  <span>Size: {order.size}</span>
                  <span>Status: {order.status || 'Pending'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
