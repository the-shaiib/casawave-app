import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import hoodieImg from '../../assets/pr.png';
import { API_BASE_URL, notifyUser, parseApiError } from '../../config/api';
import './AllProducts.css';

const CATEGORY_FILTERS = ['All', 'Hoodies', 'T-shirts', 'Pants', 'Ensemble'];

const mapApiProductToUi = (product) => {
  const image = product?.image || hoodieImg;
  const extraImages = Array.isArray(product?.additionalImages)
    ? product.additionalImages.filter(Boolean)
    : [];

  return {
    id: product?._id || product?.id,
    name: product?.name || 'Unnamed product',
    price: Number(product?.price || 0),
    description: product?.description || '',
    category: product?.category || '',
    img: image,
    images: [image, ...extraImages],
    availableSizes: ['S', 'M', 'L', 'XL'],
  };
};

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        const mappedProducts = Array.isArray(response.data)
          ? response.data.map(mapApiProductToUi)
          : [];
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error.message);
        setProducts([]);
        notifyUser(parseApiError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <section className="all-products-page">
      <div className="all-products-header">
        <p>CASAWAVE CATALOG</p>
        <h1>All Products</h1>
      </div>

      <div className="category-chips" role="tablist" aria-label="Product categories">
        {CATEGORY_FILTERS.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? <p className="all-products-empty">Loading products...</p> : null}

      {!loading && filteredProducts.length === 0 ? (
        <p className="all-products-empty">No products found for this category.</p>
      ) : null}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default AllProducts;
