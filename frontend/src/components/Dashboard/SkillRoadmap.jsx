import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loading from '../ui/Loading';
import { CheckCircle, PlayCircle, Lock, ChevronDown, Code2, FileText, CheckSquare } from 'lucide-react';

const SkillRoadmap = ({ data: initialData }) => {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeNode, setActiveNode] = useState(2); // Initially ID 2 is Arrays (in-progress)

  useEffect(() => {
    if (!initialData) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/dashboard/full');
          const json = await res.json();
          if (res.ok && json.data) {
            setData(json.data.skillRoadmap);
          }
        } catch (error) {
          console.error("Error fetching roadmap data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialData]);

  if (loading) return <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loading message="Loading Roadmap..." /></div>;
  if (!data) return null;

  const getStatusIcon = (status, color) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} color={color} />;
      case 'in-progress': return <PlayCircle size={20} color={color} />;
      case 'locked': return <Lock size={20} color={color} />;
      default: return null;
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>Learning Roadmap</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>Interactive skill graph progression.</p>

      <div style={{ display: 'flex', flex: 1, gap: '2rem' }}>
        {/* Roadmap Line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {data.map((node, index) => (
            <React.Fragment key={node.id}>
              <div 
                onClick={() => node.status !== 'locked' && setActiveNode(node.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  cursor: node.status !== 'locked' ? 'pointer' : 'not-allowed',
                  opacity: node.status === 'locked' ? 0.5 : 1,
                  transform: activeNode === node.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: activeNode === node.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: activeNode === node.id ? '1px solid var(--border-color)' : '1px solid transparent'
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: `color-mix(in srgb, ${node.color} 15%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getStatusIcon(node.status, node.color)}
                </div>
                <span style={{ fontWeight: activeNode === node.id ? '700' : '500', color: activeNode === node.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {node.title}
                </span>
              </div>
              
              {index < data.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.25rem 0', marginLeft: '-110px' }}>
                  <div style={{ width: '2px', height: '16px', background: 'var(--border-color)' }}></div>
                  <ChevronDown size={14} color="var(--border-color)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Active Node Details */}
        <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data.find(n => n.id === activeNode)?.color }}></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{data.find(n => n.id === activeNode)?.title}</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem' }}>
              <FileText size={18} /> Learning Material
            </div>
            <div className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem' }}>
              <CheckSquare size={18} /> Concept Quiz
            </div>
            <div className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '1rem' }}>
              <Code2 size={18} /> Coding Challenge
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => toast('Continuing learning for this topic coming soon!', { icon: '🚧' })} style={{ marginTop: 'auto' }}>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillRoadmap;
