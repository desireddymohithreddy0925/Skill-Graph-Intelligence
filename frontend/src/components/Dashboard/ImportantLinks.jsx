import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, Plus, Trash2 } from 'lucide-react';
import './Dashboard.css'; // Reusing dashboard styles

const ImportantLinks = ({ user }) => {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [targetClasses, setTargetClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStaff = ['admin', 'sub admin', 'manager', 'mentor'].includes(user?.role);

  useEffect(() => {
    fetchLinks();
    if (isStaff) fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAvailableClasses(data);
    } catch(err) { console.error(err); }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/links${user?.id ? `?userId=${user.id}` : ''}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !url) return alert('Title and URL are required');
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ title, url, targetClasses, createdBy: user._id })
      });
      if (res.ok) {
        setTitle('');
        setUrl('');
        setTargetClasses([]);
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/links/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchLinks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Important Links</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Curated resources, forms, and important portals.</p>
        </div>
      </div>

      {isStaff && (
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={20} /> Add New Link</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title</label>
              <input
                type="text"
                placeholder="Link Title (e.g., Leave Application Form)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Link URL</label>
              <input type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Classes</label>
              <select multiple value={targetClasses} onChange={e => setTargetClasses(Array.from(e.target.selectedOptions, option => option.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '80px' }}>
                {availableClasses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.year})</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: '42px', alignSelf: 'flex-start', marginTop: '1.8rem' }}>Upload Link</button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading links...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {links.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No important links have been added yet.</p>}
          {links.map((link) => (
            <div key={link._id} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link size={18} color="var(--accent-primary)" />
                  {link.title}
                </h3>
                {isStaff && (
                  <button onClick={() => handleDelete(link._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }} title="Delete Link">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                Open Link <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantLinks;
