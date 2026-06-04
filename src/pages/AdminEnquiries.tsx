import React from 'react';

function AdminEnquiries() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>Customer Enquiries</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>View and manage incoming B2B enquiries.</p>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Enquiries table will go here (Fetched from Firestore).</p>
      </div>
    </div>
  );
}

export default AdminEnquiries;
