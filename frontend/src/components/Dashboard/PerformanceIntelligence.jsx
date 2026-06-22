import React from 'react';
import { BarChart2, CheckCircle, AlertTriangle, Maximize2 } from 'lucide-react';

const PerformanceIntelligence = ({ data }) => {
  if (!data) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <BarChart2 size={24} color="var(--text-secondary)" />
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--accent-primary)', background: 'rgba(0, 230, 118, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '2rem' }}>
          WEEKLY INTEL
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Performance Intelligence</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.5 }}>
        Analyzing 48 hours of active patterns to optimize recall.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <CheckCircle size={18} color="var(--success)" style={{ marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: '700' }}>{data.accuracy}% Accuracy</span> achieved in high-diff quizzes.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle size={18} color="var(--error)" style={{ marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            Focus on <span style={{ fontWeight: '700', color: 'var(--error)' }}>{data.focusArea}</span> this week.
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
        Full AI Report <Maximize2 size={16} />
      </button>
    </div>
  );
};

export default PerformanceIntelligence;
