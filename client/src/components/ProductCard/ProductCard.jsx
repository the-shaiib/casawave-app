import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const primaryImage = product.images?.[0] || product.img;

  return (
    <Link to={`/product/${product.id}`} className="p-card">
      <div className="p-img-box">
        <img src={primaryImage} alt={product.name} />
        <div className="p-overlay">
          <span>VIEW DETAILS</span>
        </div>
      </div>
      <div className="p-info">
        <h3>{product.name}</h3>
        <p className="p-price">{product.price} MAD</p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="p-card p-card-skeleton" aria-hidden="true">
      <div className="p-img-box p-skeleton-block" />
      <div className="p-info">
        <span className="p-skeleton-line p-skeleton-title" />
        <span className="p-skeleton-line p-skeleton-price" />
      </div>
    </article>
  );
}

export default ProductCard;
