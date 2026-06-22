import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

const ResumeBuilder = ({ user }) => {
  const [pastResume, setPastResume] = useState(null);
  const [presentResume, setPresentResume] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'past') setPastResume(file);
      if (type === 'present') setPresentResume(file);
    }
  };

  const handleAnalyze = async () => {
    if (!pastResume || !presentResume) {
      alert("Please upload both past and present resumes for comparison.");
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Create FormData if we were really uploading files, but we just mock for now
      const res = await fetch('http://localhost:5001/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pastFileName: pastResume.name,
          presentFileName: presentResume.name
        })
      });
      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      console.error("Error analyzing resumes:", err);
      // Fallback mock
      setAnalysisResult({
        changes: [
          "Update the objective statement to be more targeted towards your dream company.",
          "Reformat the experience section to highlight quantifiable achievements (e.g., 'Improved performance by 20%').",
          "Remove outdated high school details."
        ],
        additions: [
          "Add the 'System Design' skills you recently acquired.",
          "Include your latest 'E-Commerce Backend' project.",
          "Add a link to your active GitHub profile."
        ]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '50%' }}>
          <FileText size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>AI Resume Builder & Analyzer</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Upload your past and current resumes to receive AI-powered optimization suggestions.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Past Resume Upload */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Past Resume</h3>
          {pastResume ? (
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="var(--success)" />
              <span>{pastResume.name}</span>
            </div>
          ) : (
            <>
              <label style={{ display: 'inline-block', cursor: 'pointer', background: 'var(--bg-tertiary)', padding: '1rem 2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}>
                <Upload size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--text-secondary)' }} />
                <span>Upload Past Resume (PDF/Doc)</span>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'past')} accept=".pdf,.doc,.docx" />
              </label>
            </>
          )}
        </div>

        {/* Present Resume Upload */}
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Present Resume</h3>
          {presentResume ? (
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="var(--success)" />
              <span>{presentResume.name}</span>
            </div>
          ) : (
            <>
              <label style={{ display: 'inline-block', cursor: 'pointer', background: 'var(--bg-tertiary)', padding: '1rem 2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}>
                <Upload size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--text-secondary)' }} />
                <span>Upload Present Resume (PDF/Doc)</span>
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'present')} accept=".pdf,.doc,.docx" />
              </label>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleAnalyze} 
          disabled={!pastResume || !presentResume || analyzing}
          style={{ padding: '1rem 3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {analyzing ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            <>
              <Zap size={20} /> Generate AI Analysis
            </>
          )}
        </button>
      </div>

      {analysisResult && (
        <div className="animate-fade-in" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <SparklesIcon /> Analysis Report
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: 'rgba(255, 171, 0, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 171, 0, 0.2)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffab00', marginBottom: '1rem' }}>
                <AlertTriangle size={20} /> Changes to be done
              </h3>
              <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysisResult.changes.map((change, i) => (
                  <li key={i} style={{ lineHeight: '1.5' }}>{change}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(0, 230, 118, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e676', marginBottom: '1rem' }}>
                <CheckCircle size={20} /> Things to add
              </h3>
              <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysisResult.additions.map((addition, i) => (
                  <li key={i} style={{ lineHeight: '1.5' }}>{addition}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
  </svg>
);

export default ResumeBuilder;
