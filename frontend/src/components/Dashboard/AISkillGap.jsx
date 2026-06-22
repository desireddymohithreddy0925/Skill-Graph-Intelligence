import React from 'react';
import { BrainCircuit, CheckCircle, AlertCircle, ArrowRight, Clock } from 'lucide-react';

const AISkillGap = ({ data, onStartModule }) => {
  if (!data) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
            <BrainCircuit size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>AI Skill Gap: <span style={{ color: 'var(--accent-primary)' }}>{data.targetSkill}</span></h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Precision analysis of your core data structures mastery.</p>
          </div>
        </div>
        <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8', padding: '0.4rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
          AI RECOMMENDED
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>OVERALL MASTERY</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{data.overallMastery}%</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${data.overallMastery}%`, background: 'var(--accent-primary)', borderRadius: '4px', boxShadow: 'var(--shadow-glow)', transition: 'width 0.5s ease' }}></div>
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>ROADMAP CHECKLIST</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.roadmapChecklist.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: item.status === 'completed' ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.05)', 
                padding: '0.75rem 1rem', 
                borderRadius: '0.75rem', 
                border: item.status === 'completed' ? '1px solid var(--border-color)' : '1px solid rgba(239, 68, 68, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.status === 'completed' ? (
                    <CheckCircle size={16} color="var(--accent-primary)" />
                  ) : (
                    <AlertCircle size={16} color="var(--error)" />
                  )}
                  <span style={{ fontSize: '0.9rem', color: item.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{item.title}</span>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: item.status === 'completed' ? 'var(--text-tertiary)' : 'var(--error)' }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>AI STRATEGY</span>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Clock size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{data.aiStrategy.hoursToMaster} Hours to Master</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Intensive path optimized for your pace.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.8rem', fontWeight: '500' }}>
            {data.aiStrategy.path.map((node, idx) => (
              <React.Fragment key={idx}>
                <span style={{ color: idx === 1 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{node}</span>
                {idx < data.aiStrategy.path.length - 1 && <ArrowRight size={14} color="var(--text-tertiary)" />}
              </React.Fragment>
            ))}
          </div>

          <button onClick={onStartModule} className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', padding: '0.85rem' }}>
            Start DP Module Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISkillGap;
