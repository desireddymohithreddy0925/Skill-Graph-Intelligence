import React, { useState, useEffect, useCallback } from 'react';
import { Link, ExternalLink, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';
import './Dashboard.css';

const ImportantLinks = ({ user }) => {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [targetClasses, setTargetClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);

  const isStaff = ['admin', 'sub admin', 'manager', 'mentor'].includes(user?.role);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes', {
        credentials: 'include'
      });
      const data = await res.json();
      setAvailableClasses(data);
    } catch(err) { console.error(err); }
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/links${user?._id ? `?userId=${user._id}` : ''}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchLinks();
    if (isStaff) fetchClasses();
  }, [isStaff, fetchLinks, fetchClasses]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !url) { toast.error('Title and URL are required'); return; }
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, credentials: 'include',
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

  const requestDelete = (id) => {
    setLinkToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/links/${linkToDelete}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      fetchLinks();
      toast.success('Link deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete link');
    } finally {
      setConfirmModalOpen(false);
      setLinkToDelete(null);
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
              <label htmlFor="link-title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title</label>
              <input
                id="link-title"
                type="text"
                placeholder="Link Title (e.g., Leave Application Form)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label htmlFor="link-url" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Link URL</label>
              <input id="link-url" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label htmlFor="link-target-classes" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Classes</label>
              <select id="link-target-classes" multiple value={targetClasses} onChange={e => setTargetClasses(Array.from(e.target.selectedOptions, option => option.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '80px' }}>
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
                  <button onClick={() => requestDelete(link._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }} title="Delete Link">
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
      
      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Delete Link?"
        message="Are you sure you want to delete this link? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmModalOpen(false);
          setLinkToDelete(null);
        }}
      />
    </div>
  );
};

export default ImportantLinks;
