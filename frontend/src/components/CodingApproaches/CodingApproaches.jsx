import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Code2, Tag, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';
import '../Dashboard/Dashboard.css';

const PLATFORMS = ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'AtCoder', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CodingApproaches = ({ user }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [difficulty, setDifficulty] = useState('Medium');
  const [targetClasses, setTargetClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Delete Confirm State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);

  const isStaff = ['admin', 'sub admin', 'manager', 'mentor'].includes(user?.role);

  useEffect(() => {
    fetchProblems();
    if (isStaff) fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes', {
        credentials: 'include'
      });
      const data = await res.json();
      setAvailableClasses(data);
    } catch(err) { console.error(err); }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/coding-problems${user?._id ? `?userId=${user._id}` : ''}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProblems(data);
      } else {
        console.error('API did not return an array:', data);
        setProblems([]);
      }
    } catch (err) {
      console.error('Error fetching coding problems', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !url) { toast.error('Title and URL are required'); return; }
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/coding-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ title, url, platform, difficulty, targetClasses, createdBy: user._id })
      });
      if (res.ok) {
        setTitle('');
        setUrl('');
        setPlatform('LeetCode');
        setDifficulty('Medium');
        setTargetClasses([]);
        fetchProblems();
        toast.success('Problem created successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating problem');
    }
  };

  const requestDelete = (id) => {
    setProblemToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!problemToDelete) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/coding-problems/${problemToDelete}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      fetchProblems();
      toast.success('Problem deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Error deleting problem');
    } finally {
      setConfirmModalOpen(false);
      setProblemToDelete(null);
    }
  };

  // Group problems by platform
  const groupedProblems = PLATFORMS.reduce((acc, curr) => {
    acc[curr] = problems.filter(p => p.platform === curr);
    return acc;
  }, {});

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'var(--success)';
      case 'Medium': return '#f59f00'; // Orange
      case 'Hard': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Coding Approaches</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Practice coding problems from top platforms categorized for you.</p>
        </div>
      </div>

      {isStaff && (
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '3rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}><Plus size={20} /> Upload New Coding Problem</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problem Title</label>
              <input type="text" placeholder="e.g. Two Sum" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: '2 1 300px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problem URL</label>
              <input type="url" placeholder="https://leetcode.com/problems/..." value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Classes</label>
              <select multiple value={targetClasses} onChange={e => setTargetClasses(Array.from(e.target.selectedOptions, option => option.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '80px' }}>
                {availableClasses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.year})</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: '42px', alignSelf: 'flex-start', marginTop: '1.8rem' }}>Upload</button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading problems...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {problems.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No coding problems have been uploaded yet.</p>}
          
          {PLATFORMS.map((plat) => (
            groupedProblems[plat] && groupedProblems[plat].length > 0 && (
              <div key={plat}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <Layers size={20} color="var(--accent-primary)" />
                  {plat} Problems
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {groupedProblems[plat].map((problem) => (
                    <div key={problem._id} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }} className="hover-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {problem.title}
                        </h4>
                        {isStaff && (
                          <button onClick={() => requestDelete(problem._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.2rem' }} title="Delete Problem">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: 'auto' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.3rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                          <Code2 size={14} /> {problem.platform}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: getDifficultyColor(problem.difficulty), background: 'var(--bg-primary)', padding: '0.3rem 0.6rem', borderRadius: '1rem', border: `1px solid ${getDifficultyColor(problem.difficulty)}33` }}>
                          <Tag size={14} /> {problem.difficulty}
                        </span>
                      </div>

                      <a 
                        href={problem.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary"
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', width: '100%', fontSize: '0.9rem', padding: '0.6rem' }}
                      >
                        Solve Problem <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Delete Problem?"
        message="Are you sure you want to delete this coding problem? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmModalOpen(false);
          setProblemToDelete(null);
        }}
      />
    </div>
  );
};

export default CodingApproaches;
