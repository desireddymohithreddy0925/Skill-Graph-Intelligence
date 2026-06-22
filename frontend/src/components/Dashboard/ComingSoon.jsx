import React from 'react';
import { Hammer } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '1rem', border: '1px dashed var(--border-color)', maxWidth: '500px', width: '100%' }}>
        <Hammer size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          We are currently working hard to bring you this feature. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
