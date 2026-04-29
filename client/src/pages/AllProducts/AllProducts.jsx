import { useMemo, useState } from 'react';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import './AllProducts.css';

const CATEGORY_FILTERS = ['All', 'Hoodies', 'T-shirts', 'Pants', 'Ensemble'];
const PRODUCT_SKELETON_COUNT = 8;

function AllProducts() {
  const { products, isProductsLoading } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

  const showSkeletons = isProductsLoading && products.length === 0;

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

      {!showSkeletons && filteredProducts.length === 0 ? (
        <p className="all-products-empty">No products found for this category.</p>
      ) : null}

      <div className="products-grid" aria-busy={showSkeletons}>
        {showSkeletons
          ? Array.from({ length: PRODUCT_SKELETON_COUNT }, (_, index) => (
              <ProductCardSkeleton key={`catalog-product-skeleton-${index}`} />
            ))
          : filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export default AllProducts;
