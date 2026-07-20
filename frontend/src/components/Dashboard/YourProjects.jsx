import React, { useState, useEffect } from 'react';
import { Code2, Link, Cloud, Plus, ExternalLink, Trash2, Search, User, Hash } from 'lucide-react';
import './YourProjects.css';

const YourProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    studentName: '',
    rollNumber: '',
    githubLink: '',
    onedriveLink: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const url = new URL(import.meta.env.VITE_BASE_URL + '/api/projects');
      url.searchParams.append('email', user.email);
      url.searchParams.append('role', user.role);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_BASE_URL + '/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          ...formData
        })
      });
      
      if (response.ok) {
        setFormData({ projectName: '', studentName: '', rollNumber: '', githubLink: '', onedriveLink: '' });
        fetchProjects();
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (project.studentName && project.studentName.toLowerCase().includes(query)) ||
      (project.rollNumber && project.rollNumber.toLowerCase().includes(query)) ||
      (project.userEmail && project.userEmail.toLowerCase().includes(query)) ||
      (project.projectName && project.projectName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="your-projects-container">
      <div className="your-projects-header">
        <div>
          <h1 className="your-projects-title">
            {['admin', 'sub admin', 'manager'].includes(user?.role) ? 'All Submitted Projects' : 'Your Projects'}
          </h1>
          <p className="your-projects-subtitle">
            {['admin', 'sub admin', 'manager'].includes(user?.role)
              ? 'View and manage all student project submissions across the platform.'
              : 'Track your project repositories and presentation links in one place.'}
          </p>
        </div>
      </div>

      {!['admin', 'sub admin', 'manager'].includes(user?.role) && (
        <div className="projects-card">
          <h2 className="projects-card-title">
            <Plus size={20} color="var(--accent-primary)" />
            Add New Project
          </h2>
          <form className="add-project-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Project Name</label>
              <input 
                type="text" 
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="e.g. E-Commerce Platform"
                required 
              />
            </div>
            <div className="form-group">
              <label>Student Name</label>
              <input 
                type="text" 
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input 
                type="text" 
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                placeholder="e.g. 21BCE0000"
              />
            </div>
            <div className="form-group">
              <label>GitHub Repository URL</label>
              <input 
                type="url" 
                name="githubLink"
                value={formData.githubLink}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
                required 
              />
            </div>
            <div className="form-group">
              <label>OneDrive Link</label>
              <input 
                type="url" 
                name="onedriveLink"
                value={formData.onedriveLink}
                onChange={handleInputChange}
                placeholder="https://1drv.ms/f/s!..."
                required 
              />
            </div>
            <button type="submit" className="submit-project-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Project'}
            </button>
          </form>
        </div>
      )}

      <div className="projects-card">
        <div className="projects-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="projects-card-title" style={{ marginBottom: 0 }}>
            <Code2 size={20} color="var(--accent-primary)" />
            {['admin', 'sub admin', 'manager'].includes(user?.role) ? 'Project Directory' : 'Your Submissions'}
          </h2>
          
          {['admin', 'sub admin', 'manager'].includes(user?.role) && (
            <div className="admin-search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', minWidth: '250px' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search by name, roll number, email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="empty-state">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <Code2 size={48} opacity={0.5} />
            <p>{searchQuery ? 'No projects match your search.' : `No projects found. ${!['admin', 'sub admin', 'manager'].includes(user?.role) ? 'Add your first project above!' : ''}`}</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project._id} className="project-item">
                <div className="project-item-header">
                  <div>
                    <div className="project-item-title">{project.projectName}</div>
                    {['admin', 'sub admin', 'manager'].includes(user?.role) && (
                      <div className="project-item-user">
                        {project.studentName && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.75rem' }}><User size={12} /> {project.studentName}</span>}
                        {project.rollNumber && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.75rem' }}><Hash size={12} /> {project.rollNumber}</span>}
                        <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>{project.userEmail}</div>
                      </div>
                    )}
                  </div>
                  {!['admin', 'sub admin', 'manager'].includes(user?.role) && (
                    <button 
                      onClick={() => handleDelete(project._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="project-links">
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                    <Link size={16} />
                    View Repository
                    <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                  </a>
                  <a href={project.onedriveLink} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                    <Cloud size={16} />
                    View OneDrive Assets
                    <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourProjects;
