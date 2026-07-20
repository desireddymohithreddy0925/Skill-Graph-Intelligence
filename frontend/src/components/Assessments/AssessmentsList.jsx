import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Clock, FileQuestion } from 'lucide-react';
import Loading from '../ui/Loading';
import '../Dashboard/Dashboard.css';

const AssessmentsList = ({ user, setActiveTab, setSelectedAssessmentId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStaff = ['admin', 'sub admin', 'manager', 'mentor'].includes(user?.role);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const endpoint = isStaff 
        ? `${import.meta.env.VITE_BASE_URL}/api/assessments/admin` 
        : `${import.meta.env.VITE_BASE_URL}/api/assessments`;
      const res = await fetch(endpoint, {
        credentials: 'include'
      });
      const data = await res.json();
      setAssessments(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-title">Assessments</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Test your knowledge and skills.</p>
        </div>
        {isStaff && (
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setActiveTab('create-assessment')}
          >
            <Plus size={20} /> Create New
          </button>
        )}
      </div>

      {loading ? (
        <Loading message="Loading assessments..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {assessments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No assessments available at the moment.</p>}
          {assessments.map((assessment) => (
            <div key={assessment._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{assessment.title}</h3>
                <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', border: '1px solid var(--border-color)' }}>
                  {assessment.type === 'mcq' ? 'MCQ' : 'Coding'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{assessment.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  <FileQuestion size={16} /> {assessment.questions?.length || 0} Questions
                </span>
                {assessment.timeLimit > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    <Clock size={16} /> {assessment.timeLimit} mins
                  </span>
                )}
                {isStaff ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--accent-secondary)' }}
                    onClick={() => {
                      setSelectedAssessmentId(assessment._id);
                      setActiveTab('assessment-results');
                    }}
                  >
                    View Results
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => {
                      setSelectedAssessmentId(assessment._id);
                      setActiveTab('take-assessment');
                    }}
                  >
                    Take Assessment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentsList;
