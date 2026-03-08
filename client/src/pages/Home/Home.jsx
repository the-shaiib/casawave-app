import { Link } from 'react-router-dom';
import './Home.css';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';

function Home() {
  const { products, isProductsLoading, siteSettings } = useStore();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-kicker">CASAWAVE</p>
          <h1>Ride the Wave of Modern Style.</h1>
          <p className="hero-description">
            CASAWAVE is a modern online store inspired by the energy of Casablanca and the
            creativity of the new generation.
          </p>

          <div className="hero-points">
            <span>Quality products</span>
            <span>Clean shopping experience</span>
            <span>Designed for everyday life</span>
          </div>

          <div className="hero-actions">
            <Link to="/products" className="hero-btn hero-btn-primary">
              Shop Now
            </Link>
            <Link to="/about" className="hero-btn hero-btn-secondary">
              Our Story
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src={siteSettings.homeHeroImage}
              alt="CASAWAVE featured product"
              className="hero-main-image"
            />
          </div>
        </div>
      </section>

      <section className="collection-wrapper">
        <div className="collection-header">
          <p className="subtitle">TRENDING PRODUCTS</p>
          <h2 className="title">Simple, Practical, Stylish.</h2>
        </div>

        {isProductsLoading ? (
          <p className="home-loading">Loading products...</p>
        ) : (
          <div className="products-grid">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
