import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Package, MessageSquare, LogOut, Snowflake } from 'lucide-react';

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
      if (!firebaseUser) {
        navigate('/login');
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (checking) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Checking session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 800, fontSize: '1.25rem' }}>
            <Snowflake color="var(--primary)" size={24} />
            Farm <span>Form</span> Admin
          </div>
        </div>
        
        <nav style={{ padding: '1rem 0', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link 
            to="/admin/products" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', 
              color: location.pathname.includes('/products') ? 'var(--primary)' : 'var(--text-muted)',
              background: location.pathname.includes('/products') ? '#f0f9ff' : 'transparent',
              textDecoration: 'none', fontWeight: 600
            }}
          >
            <Package size={20} /> Products
          </Link>
          <Link 
            to="/admin/enquiries" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', 
              color: location.pathname.includes('/enquiries') ? 'var(--primary)' : 'var(--text-muted)',
              background: location.pathname.includes('/enquiries') ? '#f0f9ff' : 'transparent',
              textDecoration: 'none', fontWeight: 600
            }}
          >
            <MessageSquare size={20} /> Enquiries
          </Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', 
              background: 'white', color: '#ef4444', fontWeight: 600, cursor: 'pointer' 
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Logged in as <strong>{user.email}</strong></span>
        </header>
        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
