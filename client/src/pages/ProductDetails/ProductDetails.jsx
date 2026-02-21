import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const { getProductById, openCheckout, isProductsLoading } = useStore();
  const [selectedSizeState, setSelectedSizeState] = useState({ productId: null, size: '' });

  const product = useMemo(() => getProductById(id), [getProductById, id]);
  const productImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.img) return [product.img];
    return [];
  }, [product]);
  const [selectedImage, setSelectedImage] = useState({ productId: null, image: '' });

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

  const handleAddToCart = () => {
    if (!selectedSize) return;
    openCheckout(product, selectedSize);
  };

  return (
    <section className="details-page">
      <div className="details-grid">
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

          <button
            className="details-cta"
            type="button"
            onClick={handleAddToCart}
            disabled={!hasStock}
          >
            {hasStock ? 'ADD TO CART' : 'SOLD OUT'}
          </button>
        </article>
      </div>
    </section>
  );
}

export default ProductDetails;
