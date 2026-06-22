import React, { useState, useEffect } from 'react';
import { Building, AlertCircle, X } from 'lucide-react';
import { DashboardAPI } from '../../api/client';
import './DreamCompany.css';

const DreamCompany = () => {
  const [activeCompany, setActiveCompany] = useState('Google');
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentSkills, setStudentSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await DashboardAPI.getDreamCompanies();
        setCompanyData(response.companies);
        setStudentSkills(response.studentSkills || []);
        if (response.activeCompany) {
          setActiveCompany(response.activeCompany);
        }
      } catch (err) {
        console.error('Failed to perfectly load dream companies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!companyData) return <div>No data available</div>;

  const data = companyData[activeCompany];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="company-card animate-fade-in">
        <div className="company-header">
           <AlertCircle size={24} color="var(--accent-primary)" />
           <h3 className="company-title">My Current Skills</h3>
        </div>
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
           <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
             {studentSkills.map(skill => (
               <span key={skill} style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                 {skill} 
                 <X size={12} style={{cursor: 'pointer'}} onClick={async () => {
                   const newSkills = studentSkills.filter(s => s !== skill);
                   setStudentSkills(newSkills);
                   await DashboardAPI.saveStudentSkills(newSkills);
                   // Refresh company data to recalculate readiness
                   const res = await DashboardAPI.getDreamCompanies();
                   setCompanyData(res.companies);
                 }}/>
               </span>
             ))}
             {studentSkills.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No skills added yet.</span>}
           </div>
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill (e.g., Python)" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', flex: 1 }} />
             <button className="btn btn-primary" onClick={async () => {
               if(!newSkill.trim() || studentSkills.includes(newSkill.trim())) return;
               const newSkills = [...studentSkills, newSkill.trim()];
               setStudentSkills(newSkills);
               setNewSkill('');
               await DashboardAPI.saveStudentSkills(newSkills);
               const res = await DashboardAPI.getDreamCompanies();
               setCompanyData(res.companies);
             }}>Add Skill</button>
           </div>
        </div>
      </div>

      <div className="company-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="company-header">
          <Building size={24} color="var(--accent-primary)" />
          <h3 className="company-title">Company Match Analysis</h3>
        </div>

      <div className="company-selector-container" style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <select 
          className="company-dropdown"
          value={activeCompany}
          onChange={async (e) => {
            const newCompany = e.target.value;
            setActiveCompany(newCompany);
            try {
              await DashboardAPI.setDreamCompany(newCompany);
            } catch (err) {
              console.error('Failed to update dream company', err);
            }
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            outline: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          {Object.keys(companyData).sort().map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      <div className="company-content">
        <div className="readiness-section">
          <div className="readiness-header">
            <span className="readiness-label">{activeCompany} Readiness</span>
            <span className="readiness-value">{data.readiness}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${data.readiness}%` }}
            />
          </div>
        </div>

        <div className="missing-skills-section">
          <div className="missing-skills-title">
            <AlertCircle size={16} />
            Missing Skills for {activeCompany}
          </div>
          <div className="missing-list">
            {data?.missing?.map((skill, idx) => (
              <div key={idx} className="missing-item">
                <X size={14} color="var(--error)" />
                <span>{skill}</span>
              </div>
            ))}
            {data?.missing?.length === 0 && <p style={{ color: 'var(--success)', margin: 0, fontSize: '0.9rem' }}>You have all required technical skills!</p>}
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <AlertCircle size={18} /> AI Match Insights
          </h4>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
             <strong>Lagging Areas:</strong> {data?.aiAnalysis?.laggingAreas}
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: '1.5' }}>
             <strong>Unknown Factors:</strong> {data?.aiAnalysis?.unknownFactors}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DreamCompany;
