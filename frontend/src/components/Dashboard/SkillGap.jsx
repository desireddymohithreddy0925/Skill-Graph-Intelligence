import React, { useState, useEffect } from 'react';
import Loading from '../ui/Loading';
import { Activity, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { DashboardAPI } from '../../api/client';
import './SkillGap.css';

const SkillGap = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await DashboardAPI.getSkills();
        setSkills(response.skills);
      } catch (error) {
        console.error('Perfectly caught error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) return <Loading message="Analyzing Skill Gap..." />;
  if (!skills.length) return <div>No skill gap data found.</div>;

  const javaSkill = skills[0];

  return (
    <div className="skill-gap-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="skill-gap-header">
        <Activity size={24} color="var(--accent-primary)" />
        <h3 className="skill-gap-title">Skill Gap Heatmap</h3>
      </div>

      <div className="skill-list">
        <div className="skill-item">
          <div className="skill-item-header">
            <div className="skill-name">
              <span style={{ fontSize: '1.25rem' }}>☕</span> {javaSkill.name}
            </div>
            <div className="skill-score">{javaSkill.score}%</div>
          </div>
          
          <div className="heatmap-bar">
            {javaSkill.breakdown.map((item, idx) => (
              <div 
                key={idx} 
                className={`heat-block ${item.status === 'pass' ? 'filled' : 'missed'}`}
                title={item.name}
              />
            ))}
          </div>

          <div className="skill-breakdown">
            {javaSkill.breakdown.map((item, idx) => (
              <div key={idx} className={`sub-skill ${item.status === 'pass' ? 'check' : 'cross'}`}>
                {item.status === 'pass' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              </div>
            ))}
          </div>

          <div className="ai-explanation">
            <BrainCircuit size={16} className="ai-icon-inline" />
            <strong>AI Insight:</strong> {javaSkill.insight}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
