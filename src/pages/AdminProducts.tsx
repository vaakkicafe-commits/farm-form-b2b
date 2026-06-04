import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Edit2, Trash2, Plus, X, Eye, EyeOff } from 'lucide-react';

// Product Interface
export interface Product {
  id?: string;
  brand: string;
  name: string;
  category: string;
  packSize: string;
  cartonSize: string;
  moqCartons: number;
  badge?: string;
  suitableFor: string[];
  active: boolean;
  createdAt?: any;
}

const CATEGORIES = ["Fries & Potato", "Momos & Nuggets", "Breads & Parathas", "Ready-to-Fry Snacks", "Sauces & Dips"];

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Product>({
    brand: '',
    name: '',
    category: CATEGORIES[0],
    packSize: '',
    cartonSize: '',
    moqCartons: 1,
    badge: '',
    suitableFor: [],
    active: true
  });
  const [suitableForInput, setSuitableForInput] = useState('');

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: Product[] = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Form Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'moqCartons' ? parseInt(value) || 0 : value
    }));
  };

  // Open Modal for Add
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      brand: '', name: '', category: CATEGORIES[0], packSize: '', cartonSize: '',
      moqCartons: 1, badge: '', suitableFor: [], active: true
    });
    setSuitableForInput('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleEditClick = (product: Product) => {
    setEditingId(product.id!);
    setFormData(product);
    setSuitableForInput(product.suitableFor.join(', '));
    setIsModalOpen(true);
  };

  // Save Product (Add or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse suitableFor input
    const suitableArray = suitableForInput.split(',').map(s => s.trim()).filter(s => s);
    const productToSave = { ...formData, suitableFor: suitableArray };

    try {
      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'products', editingId), {
          ...productToSave
        });
      } else {
        // Add new
        await addDoc(collection(db, 'products'), {
          ...productToSave,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Failed to save product.");
      setLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product: ", error);
        alert("Failed to delete product.");
        setLoading(false);
      }
    }
  };

  // Toggle Active Status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), { active: !currentStatus });
      setProducts(products.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>Products Management</h1>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Brand & Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Pack Details</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No products found. Add your first product!</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.category}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ color: 'var(--secondary)' }}>{product.packSize}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{product.cartonSize} • MOQ: {product.moqCartons}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => toggleActive(product.id!, product.active)}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', 
                          borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: product.active ? '#dcfce7' : '#f1f5f9',
                          color: product.active ? '#166534' : 'var(--text-muted)'
                        }}
                      >
                        {product.active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {product.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleEditClick(product)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', marginRight: '1rem' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id!)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Brand</label>
                  <input required name="brand" value={formData.brand} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. Farm Form" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Category</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Product Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. Classic French Fries (9mm)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Pack Size</label>
                  <input required name="packSize" value={formData.packSize} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. 2.5 kg bag" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Carton Size</label>
                  <input required name="cartonSize" value={formData.cartonSize} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. 5 x 2.5 kg" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>MOQ (Cartons)</label>
                  <input type="number" min="1" required name="moqCartons" value={formData.moqCartons} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Badge (Optional)</label>
                  <input name="badge" value={formData.badge} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. Fast Moving" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--secondary)' }}>Suitable For (Comma separated)</label>
                <input required name="suitableFor" value={suitableForInput} onChange={(e) => setSuitableForInput(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="e.g. QSR, Cafes, Burger Joints" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="activeToggle" name="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} style={{ width: '1.25rem', height: '1.25rem' }} />
                <label htmlFor="activeToggle" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)' }}>Active (Visible on public catalogue)</label>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
