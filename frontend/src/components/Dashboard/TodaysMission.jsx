import React from 'react';
import { Target, Check, Info } from 'lucide-react';

const TodaysMission = ({ data, onToggle }) => {
  if (!data) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Target size={20} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Today's Mission</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {data.map((mission) => (
          <div 
            key={mission.id} 
            onClick={() => onToggle(mission.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              background: mission.completed ? 'rgba(0, 230, 118, 0.1)' : 'var(--bg-tertiary)', 
              border: mission.completed ? '1px solid rgba(0, 230, 118, 0.2)' : '1px solid transparent', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {mission.completed ? (
              <div style={{ width: '20px', height: '20px', background: 'var(--accent-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="#000" strokeWidth={3} />
              </div>
            ) : (
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--text-tertiary)', borderRadius: '4px' }}></div>
            )}
            <span style={{ fontSize: '0.85rem', color: mission.completed ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: mission.completed ? '500' : 'normal' }}>
              {mission.title}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', color: 'var(--accent-primary)', padding: '0.4rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Target size={12} />
          +50 XP
        </div>
        <Info size={16} color="var(--text-tertiary)" />
      </div>
    </div>
  );
};

export default TodaysMission;
