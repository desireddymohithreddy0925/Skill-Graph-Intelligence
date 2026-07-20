import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle, Clock } from 'lucide-react';
import './Dashboard.css';

const Support = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = import.meta.env.VITE_BASE_URL + '/api/complaints';
      if (user?.role === 'student') {
        url = `${import.meta.env.VITE_BASE_URL}/api/complaints/student/${user._id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        console.error("Expected array but got:", data);
        setComplaints([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert('Title and description are required');

    setSubmitting(true);
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, studentId: user._id })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchComplaints();
        alert('Complaint submitted successfully');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this issue as resolved?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/complaints/${id}/resolve`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role === 'support team') {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
          <div>
            <h2 className="dashboard-title">Support Center</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage and resolve student issues.</p>
          </div>
        </div>

        {loading ? <p>Loading complaints...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {complaints.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No complaints found.</p>}
            {complaints.map(c => (
              <div key={c._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{c.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.description}</p>
                  </div>
                  <span style={{ padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', background: c.status === 'resolved' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 171, 0, 0.1)', color: c.status === 'resolved' ? 'var(--success)' : 'var(--warning)' }}>
                    {c.status === 'resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {c.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    <strong>Raised by:</strong> {c.studentId?.personalInfo?.username || 'Unknown'} ({c.studentId?.email}) <br />
                    <strong>Class:</strong> {c.classId ? `${c.classId.name} (${c.classId.year})` : 'Unassigned'}
                  </div>
                  {c.status === 'open' && (
                    <button className="btn btn-primary" onClick={() => handleResolve(c._id)}>Mark as Resolved</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student View
  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Support</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Facing issues? Raise a complaint here.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy size={20} /> Raise a Complaint
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Issue Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Cannot access assessments" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="5" placeholder="Describe your issue in detail..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', resize: 'vertical' }}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Your Previous Issues</h3>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>You haven't raised any issues yet.</p>}
              {complaints.map(c => (
                <div key={c._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>{c.title}</h4>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', background: c.status === 'resolved' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 171, 0, 0.1)', color: c.status === 'resolved' ? 'var(--success)' : 'var(--warning)' }}>
                      {c.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{c.description}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Submitted on: {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
