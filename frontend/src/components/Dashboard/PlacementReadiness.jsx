import React from 'react';

const PlacementReadiness = ({ data }) => {
  if (!data) return null;

  const metrics = [
    { label: 'TECHNICAL', value: data.technical },
    { label: 'COMMUNICATION', value: data.communication },
    { label: 'CONSISTENCY', value: data.consistency },
    { label: 'PROJECTS', value: data.projects }
  ];

  return (
    <div className="card placement-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: '600' }}>Placement Readiness</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI validation across core competency clusters.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-primary)', lineHeight: '1' }}>{data.overall}%</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '0.05em' }}>PRODUCT READY</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {metrics.map((metric, index) => (
          <div key={index} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{metric.label}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '100%', 
                width: `${metric.value}%`, 
                background: metric.value > 80 ? 'var(--accent-primary)' : metric.value > 65 ? 'var(--text-tertiary)' : 'var(--error)',
                borderRadius: '2px',
                boxShadow: metric.value > 80 ? 'var(--shadow-glow)' : 'none'
              }}></div>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: '700' }}>{metric.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacementReadiness;
