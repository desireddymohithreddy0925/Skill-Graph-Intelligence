import React, { useState, useEffect } from 'react';
import Loading from '../ui/Loading';
import { ArrowLeft, Trophy, Search } from 'lucide-react';
import '../Dashboard/Dashboard.css';

const AssessmentResults = ({ assessmentId, setActiveTab }) => {
  const [results, setResults] = useState([]);
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchAssessmentDetails();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [assessmentId, selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch(err) { console.error(err); }
  };

  const fetchAssessmentDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/assessments/${assessmentId}`);
      const data = await res.json();
      setAssessmentDetails(data);
    } catch(err) { console.error(err); }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5001/api/assessments/${assessmentId}/leaderboard`;
      if (selectedClassId) {
        url += `?classId=${selectedClassId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setResults(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => {
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => setActiveTab('assessments')}
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Assessments
      </button>

      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={28} color="var(--warning)" />
            {assessmentDetails ? `${assessmentDetails.title} Results` : 'Assessment Results'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>View student rankings sorted from highest score to lowest.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
        <select 
          value={selectedClassId} 
          onChange={e => setSelectedClassId(e.target.value)}
          style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minWidth: '200px' }}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.year})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading message="Loading results..." />
      ) : (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-tertiary)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Rank</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Name</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Score</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No results found for this assessment/class.
                  </td>
                </tr>
              )}
              {filteredResults.map((r, index) => {
                const percentage = Math.round((r.score / r.totalQuestions) * 100) || 0;
                let rankColor = 'var(--text-primary)';
                if (r.rank === 1) rankColor = '#ffd700'; // Gold
                else if (r.rank === 2) rankColor = '#c0c0c0'; // Silver
                else if (r.rank === 3) rankColor = '#cd7f32'; // Bronze
                
                return (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', ':hover': { background: 'var(--bg-tertiary)' } }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: rankColor }}>#{r.rank}</td>
                    <td style={{ padding: '1rem' }}>{r.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{r.email}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{r.score} / {r.totalQuestions}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: 'var(--bg-primary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: percentage >= 80 ? 'var(--success)' : percentage >= 50 ? 'var(--warning)' : 'var(--error)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem' }}>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssessmentResults;
