import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Package, Truck, MessageSquare, Snowflake } from 'lucide-react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

type B2BProduct = {
  id: string;
  brand: string;
  name: string;
  category: "Fries & Potato" | "Momos & Nuggets" | "Breads & Parathas" | "Ready-to-Fry Snacks" | "Sauces & Dips" | "Meats & Cold Cuts";
  packSize: string;
  cartonSize: string;
  moqCartons: number;
  suitableFor: string[];
  badge?: string;
  imageUrl?: string;
};

// Fallback static products in case Firestore is empty or fails
const FALLBACK_PRODUCTS: B2BProduct[] = [
  {
    id: "p1",
    brand: "Farm Form",
    name: "Classic French Fries (9mm)",
    category: "Fries & Potato",
    packSize: "2.5 kg bag",
    cartonSize: "5 x 2.5 kg",
    moqCartons: 1,
    suitableFor: ["QSR", "Cafes", "Burger Joints"],
    badge: "Fast Moving"
  },
  {
    id: "p2",
    brand: "Farm Form",
    name: "Spicy Potato Wedges",
    category: "Fries & Potato",
    packSize: "1.5 kg bag",
    cartonSize: "6 x 1.5 kg",
    moqCartons: 1,
    suitableFor: ["Cafes", "Pubs", "Restaurants"]
  },
  {
    id: "p3",
    brand: "Vaakki",
    name: "Chicken Nuggets",
    category: "Momos & Nuggets",
    packSize: "1 kg pack",
    cartonSize: "10 x 1 kg",
    moqCartons: 2,
    suitableFor: ["QSR", "Cafes", "Retail"],
    badge: "Best for QSRs"
  },
  {
    id: "p4",
    brand: "Vaakki",
    name: "Veg Momos (Darjeeling Style)",
    category: "Momos & Nuggets",
    packSize: "100 pcs bag",
    cartonSize: "5 bags",
    moqCartons: 1,
    suitableFor: ["Street Food", "Cafes", "Restaurants"]
  },
  {
    id: "p5",
    brand: "Farm Form",
    name: "Malabar Paratha",
    category: "Breads & Parathas",
    packSize: "30 pcs pack",
    cartonSize: "10 packs",
    moqCartons: 1,
    suitableFor: ["Dhabas", "Restaurants", "Caterers"]
  },
  {
    id: "p6",
    brand: "Farm Form",
    name: "Aloo Tikki Burger Patty",
    category: "Ready-to-Fry Snacks",
    packSize: "20 pcs pack",
    cartonSize: "8 packs",
    moqCartons: 2,
    suitableFor: ["QSR", "Burger Joints"]
  },
  {
    id: "p7",
    brand: "Vaakki",
    name: "Tandoori Mayo",
    category: "Sauces & Dips",
    packSize: "1 kg pouch",
    cartonSize: "12 pouches",
    moqCartons: 1,
    suitableFor: ["QSR", "Cafes", "Street Food"]
  },
  {
    id: "p8",
    brand: "Lee Vaakki",
    name: "Hickory Smoked Veal Strips",
    category: "Meats & Cold Cuts",
    packSize: "280g pack",
    cartonSize: "20 packs",
    moqCartons: 1,
    suitableFor: ["Cafes", "Restaurants", "Delis"],
    badge: "Premium Halal",
    imageUrl: "/images/veal_strips.png"
  },
  {
    id: "p9",
    brand: "Lee Vaakki",
    name: "Chicken Curry Cut Skinless",
    category: "Meats & Cold Cuts",
    packSize: "400g pack",
    cartonSize: "15 packs",
    moqCartons: 1,
    suitableFor: ["Dhabas", "Restaurants", "Retail"],
    imageUrl: "/images/chicken_curry_cut.png"
  },
  {
    id: "p10",
    brand: "Lee Vaakki",
    name: "Popcorn Chicken",
    category: "Ready-to-Fry Snacks",
    packSize: "1.0 kg bag",
    cartonSize: "6 bags",
    moqCartons: 1,
    suitableFor: ["QSR", "Cafes", "Food Trucks"],
    imageUrl: "/images/popcorn_chicken.png"
  },
  {
    id: "p11",
    brand: "Lee Vaakki",
    name: "Chicken Breast Strips",
    category: "Ready-to-Fry Snacks",
    packSize: "26 pieces pack",
    cartonSize: "8 packs",
    moqCartons: 1,
    suitableFor: ["Cafes", "Burger Joints", "QSR"],
    imageUrl: "/images/chicken_breast_strips.png"
  }
];

const CATEGORIES = ["All", "Fries & Potato", "Momos & Nuggets", "Breads & Parathas", "Ready-to-Fry Snacks", "Sauces & Dips", "Meats & Cold Cuts"];

function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<B2BProduct[]>(FALLBACK_PRODUCTS);

  // Enquiry Form State
  const [enquiry, setEnquiry] = useState({ name: '', shopName: '', phone: '', city: '', message: '' });
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    try {
      await addDoc(collection(db, 'enquiries'), {
        ...enquiry,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setEnquiryStatus('success');
      setEnquiry({ name: '', shopName: '', phone: '', city: '', message: '' });
      setTimeout(() => setEnquiryStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setEnquiryStatus('error');
    }
  };

  useEffect(() => {
    const fetchActiveProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('active', '==', true));
        const querySnapshot = await getDocs(q);
        const prods: B2BProduct[] = [];
        querySnapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...doc.data() } as B2BProduct);
        });
        
        if (prods.length > 0) {
          setProducts(prods);
        }
      } catch (error) {
        console.error("Error fetching public products:", error);
      }
    };
    fetchActiveProducts();
  }, []);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <header>
        <div className="container header-container">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <a href="#" className="logo">
              <Snowflake color="#0284c7" />
              Lee Vaakki <span>Farm</span>
            </a>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '-4px' }}>For Distributors & Retail Shops Only</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="tel:7358096393" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Phone size={18} />
              <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>7358096393</span>
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container animate-slide-up">
          <div style={{ display: 'inline-block', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            B2B Wholesale Catalogue
          </div>
          <h1 className="hero-title">
            <span>Lee Vaakki Farm</span><br/> Premium frozen & ready‑to‑cook products for cafés, restaurants, and retail shops.
          </h1>
          <p className="section-subtitle">
            Premium quality frozen products supplied directly to your business. We currently supply to wholesale and city retail shops only. No minimum order constraints for self-pickup!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:7358096393" className="btn btn-primary">
              <Phone size={20} /> Call to Place Order
            </a>
            <a href="mailto:vaakkicafe@gmail.com" className="btn btn-outline">
              <Mail size={20} /> Email Wholesale Enquiry
            </a>
          </div>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(2,132,199,0.1)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trusted Brands We Distribute</p>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', opacity: 0.6, flexWrap: 'wrap', fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>
              <span>ITC MasterChef</span>
              <span>CP Easy Snack</span>
              <span>McCain</span>
              <span>Sumeru</span>
              <span>Vaakki</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'white' }} id="catalogue">
        <div className="container">
          <h2 className="section-title">Product Catalogue</h2>
          <p className="section-subtitle">Browse our premium frozen assortment. Call us for today's wholesale pricing.</p>
          
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <span className="product-brand">{product.brand}</span>
                  {product.badge && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {product.badge}
                    </span>
                  )}
                  {/* Placeholder image using Unsplash, customized per category */}
                  <img 
                    src={product.imageUrl || (product.category.includes('Fries') ? 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=600' : 
                         product.category.includes('Momos') ? 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=600' : 
                         product.category.includes('Breads') ? 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=600' :
                         'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600')} 
                    alt={product.name} 
                    className="product-image" 
                  />
                </div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Pack Size</span>
                      <span className="detail-value">{product.packSize}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Carton Size</span>
                      <span className="detail-value">{product.cartonSize}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">MOQ</span>
                      <span className="detail-value">{product.moqCartons} Carton(s)</span>
                    </div>
                    <div className="detail-row" style={{ borderBottom: 'none', paddingTop: '0.5rem' }}>
                      <span className="detail-label" style={{ fontSize: '0.75rem' }}>Suitable for: {product.suitableFor.join(", ")}</span>
                    </div>
                  </div>
                  
                  <div className="product-action">
                    <a href={`https://wa.me/917358096393?text=Hi Lee Vaakki Farm, I would like to enquire about wholesale pricing for ${product.name} (${product.cartonSize}).`} target="_blank" rel="noreferrer" className="btn-enquire">
                      <MessageSquare size={18} /> Send Enquiry
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <h2 className="section-title">How to Order</h2>
          <p className="section-subtitle">A simple, transparent process for our B2B partners.</p>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <Package size={32} />
              </div>
              <h3 className="info-title">1. Browse & Select</h3>
              <p className="info-desc">Check our catalogue for product details, pack sizes, and carton quantities suitable for your business.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Phone size={32} />
              </div>
              <h3 className="info-title">2. Call or WhatsApp</h3>
              <p className="info-desc">Contact our sales team at <strong>7358096393</strong> to confirm pricing, stock availability, and MOQ.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Truck size={32} />
              </div>
              <h3 className="info-title">3. Delivery Dispatch</h3>
              <p className="info-desc">Once your order is confirmed, we dispatch the frozen goods via our cold-chain network to your shop.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'white' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Quick Enquiry</h2>
          <p className="section-subtitle">Need bulk pricing or have a specific requirement? Drop your details and our sales team will call you back.</p>
          
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginTop: '2rem' }}>
            {enquiryStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#166534', background: '#dcfce7', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank you!</h3>
                <p>Your enquiry has been received. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Your Name *</label>
                    <input required value={enquiry.name} onChange={(e) => setEnquiry({...enquiry, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Shop / Business Name *</label>
                    <input required value={enquiry.shopName} onChange={(e) => setEnquiry({...enquiry, shopName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="My Cafe" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Phone Number *</label>
                    <input required type="tel" value={enquiry.phone} onChange={(e) => setEnquiry({...enquiry, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="10-digit number" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>City / Area *</label>
                    <input required value={enquiry.city} onChange={(e) => setEnquiry({...enquiry, city: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. Bangalore" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>What are you looking for? (Optional)</label>
                  <textarea value={enquiry.message} onChange={(e) => setEnquiry({...enquiry, message: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px', resize: 'vertical' }} placeholder="e.g. I need 50 cartons of French Fries per month." />
                </div>

                {enquiryStatus === 'error' && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>Failed to submit enquiry. Please try again.</div>
                )}

                <button type="submit" disabled={enquiryStatus === 'submitting'} className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                  {enquiryStatus === 'submitting' ? 'Submitting...' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'white', paddingBottom: '8rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <MapPin size={48} color="#0284c7" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="section-title">Service Areas</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--secondary)', marginBottom: '1rem', fontWeight: 500 }}>
            We currently deliver in <strong>Chennai, Bangalore, and surrounding regions.</strong>
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Minimum order value applies per delivery route (e.g. ₹5,000 per route).<br/>
            Contact us for exact delivery schedules in your specific locality.
          </p>
        </div>
      </section>

      {/* Sticky Contact Bar */}
      <div className="sticky-contact">
        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Ready to place an order?</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="tel:7358096393" className="btn btn-primary" style={{ background: 'white', color: 'var(--secondary)' }}>
            <Phone size={18} /> Call 7358096393
          </a>
          <a href="mailto:vaakkicafe@gmail.com" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
            <Mail size={18} /> Email Us
          </a>
        </div>
      </div>
    </>
  );
}

export default Home;
