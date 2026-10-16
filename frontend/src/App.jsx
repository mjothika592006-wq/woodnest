import { useEffect, useMemo, useState } from 'react';

const defaultProducts = [
  {
    _id: '1',
    name: 'Aurelia Velvet Sectional',
    category: 'Sofas',
    material: 'Velvet',
    price: 3450,
    ratings: 4.8,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    description: 'Plush modular seating designed for elevated living rooms.'
  },
  {
    _id: '2',
    name: 'Oslo Walnut Armchair',
    category: 'Chairs',
    material: 'Walnut',
    price: 1200,
    ratings: 4.9,
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'],
    description: 'Curved walnut form paired with luxe leather comfort.'
  },
  {
    _id: '3',
    name: 'Koto Marble Table',
    category: 'Dining Tables',
    material: 'Marble',
    price: 890,
    ratings: 4.7,
    images: ['https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=800&q=80'],
    description: 'Organic stone elegance that anchors every room.'
  },
  {
    _id: '4',
    name: 'Biblios Wall Unit',
    category: 'Office Furniture',
    material: 'Solid Oak',
    price: 2100,
    ratings: 4.8,
    images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'],
    description: 'Statement storage with warm oak texture and tailored detail.'
  }
];

const categories = ['Sofas', 'Chairs', 'Dining Tables', 'Office Furniture'];

function App() {
  const [products, setProducts] = useState(defaultProducts);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data.length ? data.slice(0, 8) : defaultProducts);
      } catch (error) {
        console.warn('Using fallback product data:', error.message);
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const featured = useMemo(() => products.slice(0, 3), [products]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">W</div>
          <div>
            <p className="eyebrow">Luxury home design</p>
            <h1>WoodNest</h1>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <a href="#collections">Collections</a>
          <a href="#featured">Featured</a>
          <a href="#journal">Journal</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav-actions">
          <button className="ghost-btn" type="button">Search</button>
          <button className="cart-btn" type="button">Cart ({cartCount})</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Curated living spaces</p>
            <h2>Furniture crafted for the way you live.</h2>
            <p className="hero-text">
              Discover refined sofas, statement chairs, sculptural tables, and heirloom-quality
              pieces made to transform daily rituals into beautiful experiences.
            </p>
            <div className="cta-row">
              <button type="button" className="primary-btn">Shop now</button>
              <button type="button" className="secondary-btn">Book a consult</button>
            </div>
            <div className="trust-row">
              <div>
                <strong>1.2k+</strong>
                <span>happy homes</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>average rating</span>
              </div>
              <div>
                <strong>48h</strong>
                <span>white-glove delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Featured furniture collection">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury wooden furniture living room"
            />
          </div>
        </section>

        <section className="collections" id="collections">
          <div className="section-heading">
            <p className="eyebrow">Shop by room</p>
            <h3>Curated collections</h3>
          </div>
          <div className="collection-grid">
            {categories.map((category) => (
              <article key={category} className="collection-card">
                <span>{category}</span>
                <button type="button">Explore</button>
              </article>
            ))}
          </div>
        </section>

        <section className="featured" id="featured">
          <div className="section-heading">
            <p className="eyebrow">Best sellers</p>
            <h3>Featured pieces</h3>
          </div>

          {loading ? (
            <p className="loading">Loading pieces from the showroom…</p>
          ) : (
            <div className="product-grid">
              {featured.map((product) => (
                <article key={product._id} className="product-card">
                  <img src={product.images?.[0]} alt={product.name} />
                  <div className="product-copy">
                    <div className="product-row">
                      <span className="pill">{product.category}</span>
                      <span className="rating">★ {product.ratings}</span>
                    </div>
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <div className="product-meta">
                      <strong>${product.price.toLocaleString()}</strong>
                      <button type="button" onClick={() => setCartCount((count) => count + 1)}>
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="showroom-panel" id="journal">
          <div>
            <p className="eyebrow">Design notes</p>
            <h3>Thoughtful pieces, richly layered rooms.</h3>
          </div>
          <p>
            From tactile bouclé to sculptural walnut, WoodNest pairs natural materials with modern
            silhouettes to help every room feel grounded and beautifully alive.
          </p>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div>
          <strong>WoodNest</strong>
          <span>Luxury furniture studio</span>
        </div>
        <div>
          <a href="mailto:hello@woodnest.com">hello@woodnest.com</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
