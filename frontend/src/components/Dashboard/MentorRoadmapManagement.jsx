import React, { useState, useEffect } from 'react';
import { Search, Trash2, Network } from 'lucide-react';
import '../Dashboard/Dashboard.css';

const MentorRoadmapManagement = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'class'
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Roadmap states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentRoadmap, setStudentRoadmap] = useState([]);
  const [newRoadmapNode, setNewRoadmapNode] = useState({ title: '', status: 'locked', color: 'var(--text-tertiary)' });

  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  const fetchStudentsAndClasses = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch(import.meta.env.VITE_BASE_URL + '/api/profile/all'),
        fetch(import.meta.env.VITE_BASE_URL + '/api/classes')
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      setStudents(uData.filter(u => u.role === 'student'));
      setClassesList(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoadmap = async (u) => {
    setSelectedStudent(u);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/roadmap/${u._id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentRoadmap(data.skillRoadmap || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveRoadmap = async () => {
    try {
      if (activeTab === 'student') {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/roadmap/${selectedStudent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillRoadmap: studentRoadmap })
        });
        if (res.ok) alert('Roadmap updated successfully');
      } else {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/roadmap/class/${selectedClass._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillRoadmap: studentRoadmap })
        });
        if (res.ok) alert('Roadmap successfully broadcasted to entire class!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update roadmap');
    }
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = s.personalInfo?.username?.toLowerCase() || '';
    const email = s.email.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (selectedStudent || selectedClass) {
    const isClassMode = activeTab === 'class';
    const title = isClassMode 
      ? `Skill Roadmap Broadcast: ${selectedClass.name} (${selectedClass.year})` 
      : `Skill Roadmap: ${selectedStudent.personalInfo?.username || selectedStudent.email}`;
      
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => { setSelectedStudent(null); setSelectedClass(null); setStudentRoadmap([]); }} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to {isClassMode ? 'Classes' : 'Students'}
        </button>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={24} /> {title}
            </h2>
            <button className="btn btn-primary" onClick={handleSaveRoadmap}>
              {isClassMode ? 'Apply to Entire Class' : 'Save Changes'}
            </button>
          </div>
          
          {isClassMode && (
            <div style={{ padding: '1rem', background: 'rgba(255, 171, 0, 0.1)', border: '1px solid var(--warning)', borderRadius: '0.5rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>
              <strong>Warning:</strong> Saving this roadmap will overwrite the existing roadmap for ALL students in this class. Use this to quickly assign standard paths.
            </div>
          )}
          
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
          <h2 className="dashboard-title">Roadmap Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Select a student to edit individually, or a class to assign roadmaps in bulk.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('student')}>Manage Individual Student</button>
        <button className={`btn ${activeTab === 'class' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('class')}>Manage Entire Class</button>
      </div>

      {activeTab === 'student' ? (
        <>
          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
            />
          </div>

          {loading ? (
            <p>Loading students...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {filteredStudents.map(s => (
                <div key={s._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 'bold' }}>
                      {s.personalInfo?.username ? s.personalInfo.username[0].toUpperCase() : s.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.personalInfo?.username || 'Unnamed'}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOpenRoadmap(s)}
                    style={{ marginTop: 'auto', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Manage Roadmap
                  </button>
                </div>
              ))}
              {filteredStudents.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No students found.</p>}
            </div>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <p>Loading classes...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {classesList.map(cls => (
                <div key={cls._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'rgba(50, 150, 255, 0.2)', color: '#4dabf7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      C
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{cls.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cls.year} • {cls.studentCount || 0} Students</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedClass(cls); setStudentRoadmap([]); }}
                    style={{ marginTop: 'auto', background: 'var(--accent-primary)', border: 'none', color: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Broadcast Roadmap
                  </button>
                </div>
              ))}
              {classesList.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No classes found.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MentorRoadmapManagement;
