import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Copy, MailX } from 'lucide-react';

export interface Enquiry {
  id?: string;
  name: string;
  shopName: string;
  phone: string;
  city: string;
  message: string;
  status: 'new' | 'in_progress' | 'closed';
  createdAt?: any;
}

function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const enqs: Enquiry[] = [];
      querySnapshot.forEach((doc) => {
        enqs.push({ id: doc.id, ...doc.data() } as Enquiry);
      });
      setEnquiries(enqs);
    } catch (error) {
      console.error("Error fetching enquiries: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: Enquiry['status']) => {
    try {
      await updateDoc(doc(db, 'enquiries', id), { status: newStatus });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const getStatusBadge = (status: Enquiry['status']) => {
    switch (status) {
      case 'new':
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>New</span>;
      case 'in_progress':
        return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>In Progress</span>;
      case 'closed':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>Customer Enquiries</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View and manage incoming B2B leads.</p>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Contact Info</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Location & Requirements</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && enquiries.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading enquiries...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MailX size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--secondary)' }}>No enquiries yet</p>
                    <p>When customers fill out the Quick Enquiry form, they will appear here.</p>
                  </td>
                </tr>
              ) : (
                enquiries.map(enq => {
                  const dateStr = enq.createdAt?.toDate ? enq.createdAt.toDate().toLocaleDateString() : 'Just now';
                  
                  return (
                    <tr key={enq.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{enq.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{enq.shopName}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {enq.phone}
                          <button onClick={() => navigator.clipboard.writeText(enq.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }} title="Copy Phone">
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--secondary)' }}>{enq.city}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {enq.message || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No message provided</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {getStatusBadge(enq.status)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <select 
                          value={enq.status} 
                          onChange={(e) => updateStatus(enq.id!, e.target.value as Enquiry['status'])}
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600, background: '#f8fafc', color: 'var(--secondary)', cursor: 'pointer' }}
                        >
                          <option value="new">Mark New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Close Lead</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminEnquiries;
