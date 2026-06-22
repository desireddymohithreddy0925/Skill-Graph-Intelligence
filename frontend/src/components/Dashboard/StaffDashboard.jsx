import React, { useState, useEffect } from 'react';
import { Users, Search, User, Briefcase, BarChart2, Building } from 'lucide-react';
import Profile from './Profile';
import { DashboardAPI } from '../../api/client';
import './Dashboard.css'; // Reuse Dashboard styles where possible

const StaffDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  
  // Role assignment states
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState('mentor');
  
  // Dream Company Management states
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanySkills, setNewCompanySkills] = useState('');

  // Roadmap Management states
  const [isManagingRoadmap, setIsManagingRoadmap] = useState(false);
  const [studentRoadmap, setStudentRoadmap] = useState([]);
  const [newRoadmapNode, setNewRoadmapNode] = useState({ title: '', status: 'locked', color: 'var(--text-tertiary)' });
  
  useEffect(() => {
    fetchUsers();
    if (['admin', 'sub admin', 'manager'].includes(user?.role)) {
      fetchRoles();
      fetchCompaniesAdmin();
    }
  }, [user]);

  const fetchCompaniesAdmin = async () => {
    try {
      const data = await DashboardAPI.getDreamCompaniesAdmin();
      setCompanies(data);
    } catch (err) { console.error(err); }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/profile/all');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'student') return false; // Hide students from staff directory
    const q = searchQuery.toLowerCase();
    const name = u.personalInfo?.username?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const role = u.role?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const handleOpenRoadmap = async (u) => {
    setSelectedUser(u);
    try {
      const res = await fetch(`http://localhost:5001/api/dashboard/roadmap/${u._id}`);
      if(res.ok) {
        const data = await res.json();
        setStudentRoadmap(data.skillRoadmap || []);
      }
    } catch(err) { console.error(err); }
    setIsManagingRoadmap(true);
  };

  if (selectedUser && !isManagingRoadmap) {
    return (
      <div className="staff-view-container">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
            &larr; Back to Directory
          </button>
          {selectedUser.role === 'student' && (
            <button className="btn btn-primary" onClick={() => handleOpenRoadmap(selectedUser)}>
              Manage Skill Roadmap
            </button>
          )}
        </div>
        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <h3>Viewing Profile: {selectedUser.personalInfo?.username || selectedUser.email} ({selectedUser.role})</h3>
        </div>
        {/* Render the profile component with the selected user's data */}
        <Profile user={selectedUser} isReadOnly={true} />

        {isAssigning && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>Assign Task to {selectedUser.personalInfo?.username || selectedUser.email}</h3>
              <input type="text" placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <textarea placeholder="Description" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsAssigning(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await fetch('http://localhost:5001/api/assignments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mentorId: user._id, studentId: selectedUser._id, title: taskTitle, description: taskDesc })
                    });
                    setIsAssigning(false);
                    setTaskTitle('');
                    setTaskDesc('');
                    alert('Task assigned successfully!');
                  } catch (err) { console.error(err); }
                }}>Assign Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isManagingRoadmap && selectedUser) {
    return (
      <div className="staff-view-container" style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => setIsManagingRoadmap(false)} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Profile
        </button>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--accent-primary)', margin: 0 }}>Skill Roadmap: {selectedUser.personalInfo?.username || selectedUser.email}</h2>
            <button className="btn btn-primary" onClick={async () => {
              try {
                const res = await fetch(`http://localhost:5001/api/dashboard/roadmap/${selectedUser._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ skillRoadmap: studentRoadmap })
                });
                if(res.ok) alert('Roadmap updated successfully');
              } catch(err) { console.error(err); alert('Failed to update'); }
            }}>Save Changes</button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Skill / Topic Title</label>
              <input type="text" value={newRoadmapNode.title} onChange={(e) => setNewRoadmapNode({...newRoadmapNode, title: e.target.value})} placeholder="e.g. React Fundamentals" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status</label>
              <select value={newRoadmapNode.status} onChange={(e) => {
                const status = e.target.value;
                const color = status === 'completed' ? 'var(--success)' : status === 'in-progress' ? 'var(--warning)' : 'var(--text-tertiary)';
                setNewRoadmapNode({...newRoadmapNode, status, color});
              }} style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <option value="locked">Locked</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={() => {
              if(!newRoadmapNode.title) return;
              setStudentRoadmap([...studentRoadmap, { id: Date.now().toString(), ...newRoadmapNode }]);
              setNewRoadmapNode({ title: '', status: 'locked', color: 'var(--text-tertiary)' });
            }} style={{ padding: '0.75rem 1.5rem' }}>Add Node</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {studentRoadmap.map((node, idx) => (
              <div key={node.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${node.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: node.color }}></div>
                  <span style={{ fontWeight: 'bold' }}>{node.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <select value={node.status} onChange={(e) => {
                    const newRoadmap = [...studentRoadmap];
                    const status = e.target.value;
                    newRoadmap[idx].status = status;
                    newRoadmap[idx].color = status === 'completed' ? 'var(--success)' : status === 'in-progress' ? 'var(--warning)' : 'var(--text-tertiary)';
                    setStudentRoadmap(newRoadmap);
                  }} style={{ padding: '0.4rem', borderRadius: '0.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <option value="locked">Locked</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={() => setStudentRoadmap(studentRoadmap.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem' }}>✕</button>
                </div>
              </div>
            ))}
            {studentRoadmap.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No roadmap nodes yet. Add one above.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Staff Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and view all students and staff members.</p>
        </div>
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-label">TOTAL STAFF</span>
            <span className="stat-value text-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24}/> {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {user?.role !== 'manager' && (
        <>
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search by name, email, or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading directory...</p>
          ) : (
            <div className="users-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredUsers.map(u => (
                <div key={u._id} className="user-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {u.personalInfo?.username ? u.personalInfo.username[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : '?')}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{u.personalInfo?.username || 'Unnamed'}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: ['admin', 'sub admin', 'manager'].includes(u.role) ? 'rgba(255, 50, 50, 0.2)' : u.role === 'mentor' ? 'rgba(50, 150, 255, 0.2)' : 'rgba(50, 255, 100, 0.2)',
                      color: ['admin', 'sub admin', 'manager'].includes(u.role) ? '#ff6b6b' : u.role === 'mentor' ? '#4dabf7' : '#51cf66'
                    }}>
                      {(u.role || 'unknown').toUpperCase()}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['admin', 'sub admin', 'manager'].includes(user?.role) && u.role !== 'student' && u.email !== user?.email && (
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to demote ${u.personalInfo?.username || u.email} to student?`)) {
                              try {
                                const res = await fetch('http://localhost:5001/api/roles/assign', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: u.email, roleName: 'student' })
                                });
                                if (res.ok) {
                                  fetchUsers();
                                } else {
                                  alert('Failed to demote user');
                                }
                              } catch (err) { console.error(err); }
                            }
                          }}
                          style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                          title="Demote to Student"
                        >
                          Demote
                        </button>
                      )}
                      {['mentor', 'admin', 'sub admin', 'manager'].includes(user.role) && (
                        <button onClick={() => { setSelectedUser(u); setIsAssigning(true); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Assign Task
                        </button>
                      )}
                      <button  
                        onClick={() => setSelectedUser(u)}
                        style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p>No users found.</p>}
            </div>
          )}
        </>
      )}

      {['admin', 'sub admin', 'manager'].includes(user?.role) && (
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Role Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create dynamic roles (e.g., Sub Admin, Guest). Users with these roles will have Staff access.</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              placeholder="New Role Name..." 
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: 1 }}
            />
            <button className="btn btn-primary" onClick={async () => {
              if (!newRoleName.trim()) return;
              try {
                const res = await fetch('http://localhost:5001/api/roles', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newRoleName })
                });
                if (res.ok) {
                  setNewRoleName('');
                  fetchRoles();
                } else {
                  alert('Error creating role. Maybe it already exists.');
                }
              } catch (err) { console.error(err); }
            }}>Create Role</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {roles.map(r => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
                <span>{r.name}</span>
                <button onClick={async () => {
                  try {
                    await fetch(`http://localhost:5001/api/roles/${r._id}`, { method: 'DELETE' });
                    fetchRoles();
                  } catch(err) { console.error(err); }
                }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Assign Role to User</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="email" 
              placeholder="User Email Address" 
              value={assignEmail}
              onChange={e => setAssignEmail(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: 1 }}
            />
            <select 
              value={assignRole} 
              onChange={e => setAssignRole(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: 1 }}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
              {roles.map(r => (
                <option key={r._id} value={r.name}>{r.name.charAt(0).toUpperCase() + r.name.slice(1)}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={async () => {
              if (!assignEmail.trim()) return;
              try {
                const res = await fetch('http://localhost:5001/api/roles/assign', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: assignEmail, roleName: assignRole })
                });
                const data = await res.json();
                if (res.ok) {
                  alert(data.message);
                  setAssignEmail('');
                  fetchUsers(); // Refresh the list
                } else {
                  alert(data.error || 'Error assigning role');
                }
              } catch (err) { console.error(err); }
            }}>Assign Role</button>
          </div>
        </div>
      )}

      {['admin', 'sub admin'].includes(user?.role) && (
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={24} /> Dream Company Requirements
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Manage target companies and their required technical and soft skills.</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Company Name (e.g., Tesla)" 
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: '1 1 200px' }}
            />
            <input 
              type="text" 
              placeholder="Required Skills (comma separated)" 
              value={newCompanySkills}
              onChange={e => setNewCompanySkills(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: '2 1 400px' }}
            />
            <button className="btn btn-primary" onClick={async () => {
              if (!newCompanyName.trim() || !newCompanySkills.trim()) return;
              const reqSkills = newCompanySkills.split(',').map(s => s.trim()).filter(Boolean);
              try {
                await DashboardAPI.saveDreamCompany(newCompanyName.trim(), reqSkills);
                setNewCompanyName('');
                setNewCompanySkills('');
                fetchCompaniesAdmin();
              } catch (err) { console.error(err); alert('Error saving company'); }
            }}>Save Company</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {companies.map(c => (
              <div key={c._id} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{c.name}</h3>
                  <button onClick={async () => {
                    try {
                      await DashboardAPI.deleteDreamCompany(c._id);
                      fetchCompaniesAdmin();
                    } catch(err) { console.error(err); }
                  }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {c.requiredSkills.map((skill, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
