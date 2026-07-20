import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, Trash2, Edit2, UserPlus, Upload, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ui/ConfirmModal';
import '../Dashboard/Dashboard.css';

const ClassesManagement = ({ user }) => {
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Delete confirm state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  
  // Create / Edit State
  const [editingId, setEditingId] = useState(null);
  const [className, setClassName] = useState('');
  const [classYear, setClassYear] = useState('');
  
  // Selected Class details state
  const [selectedClass, setSelectedClass] = useState(null);
  const [mentorsDirectory, setMentorsDirectory] = useState([]);
  const [students, setStudents] = useState([]);
  const fileInputRef = useRef(null);

  // Student Details View State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTab, setStudentTab] = useState('personal'); // personal, progress, works
  const [studentProgress, setStudentProgress] = useState(null);
  const [studentWorks, setStudentWorks] = useState([]);
  const [studentRoadmap, setStudentRoadmap] = useState([]);
  const [newRoadmapNode, setNewRoadmapNode] = useState({ title: '', status: 'locked', color: 'var(--text-tertiary)' });

  // Manual Add Student State
  const [manualEmail, setManualEmail] = useState('');
  const [manualUsername, setManualUsername] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes');
      const data = await res.json();
      setClassesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!className || !classYear) { toast.error('Name and Year are required'); return; }

    try {
      if (editingId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: className, year: classYear })
        });
      } else {
        await fetch(import.meta.env.VITE_BASE_URL + '/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: className, year: classYear })
        });
      }
      setClassName('');
      setClassYear('');
      setEditingId(null);
      fetchClasses();
    } catch (err) { console.error(err); }
  };

  const requestDeleteClass = (id) => {
    setClassToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${classToDelete}`, { method: 'DELETE' });
      fetchClasses();
      toast.success('Class deleted successfully');
    } catch (err) { 
      console.error(err); 
      toast.error('Failed to delete class');
    } finally {
      setConfirmModalOpen(false);
      setClassToDelete(null);
    }
  };

  // ----- Inside Class View -----

  const fetchClassDetails = async (cls) => {
    setSelectedClass(cls);
    
    // Fetch mentors directory
    try {
      const mRes = await fetch(import.meta.env.VITE_BASE_URL + '/api/profile/all');
      const allUsers = await mRes.json();
      setMentorsDirectory(allUsers.filter(u => ['mentor', 'admin', 'sub admin', 'manager'].includes(u.role)));
    } catch (e) { console.error(e); }
    
    // Fetch students
    try {
      const sRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${cls._id}/students`);
      const sData = await sRes.json();
      setStudents(sData);
    } catch (e) { console.error(e); }
  };

  const toggleMentor = async (mentorId) => {
    if (!selectedClass) return;
    const currentMentors = (selectedClass.mentors || []).map(m => m._id);
    let newMentors;
    if (currentMentors.includes(mentorId)) {
      newMentors = currentMentors.filter(id => id !== mentorId);
    } else {
      newMentors = [...currentMentors, mentorId];
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${selectedClass._id}/mentors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorIds: newMentors })
      });
      const updatedClass = await res.json();
      // Update local state by repopulating mentors
      const mRes = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes');
      const allC = await mRes.json();
      const updatedFullClass = allC.find(c => c._id === updatedClass._id);
      setSelectedClass(updatedFullClass);
      setClassesList(allC);
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading and parsing CSV... This might take a moment.');

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${selectedClass._id}/upload-csv`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      toast.success(data.message || 'Upload complete', { id: toastId });
      
      // Refresh details
      fetchClassDetails(selectedClass);
      fetchClasses();
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast.error('Error uploading file', { id: toastId });
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualEmail) { toast.error('Email is required'); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/classes/${selectedClass._id}/add-student-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: manualEmail, username: manualUsername })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Student added successfully');
        setManualEmail('');
        setManualUsername('');
        fetchClassDetails(selectedClass);
        fetchClasses();
      } else {
        toast.error(data.error || 'Failed to add student');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error adding student');
    }
  };

  const fetchStudentDetails = async (student) => {
    setSelectedStudent(student);
    setStudentTab('personal');
    setStudentProgress(null);
    setStudentWorks([]);
    
    try {
      const pRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/full?userId=${student._id}`);
      const pData = await pRes.json();
      setStudentProgress(pData.data?.stats);
      
      const wRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/assignments/student/${student._id}`);
      const wData = await wRes.json();
      setStudentWorks(wData);

      const rRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/roadmap/${student._id}`);
      if(rRes.ok) {
        const rData = await rRes.json();
        setStudentRoadmap(rData.skillRoadmap || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRoadmap = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/roadmap/${selectedStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillRoadmap: studentRoadmap })
      });
      if(res.ok) {
        toast.success('Roadmap updated successfully');
      }
    } catch(err) {
      console.error(err);
      toast.error('Failed to update roadmap');
    }
  };

  const handleAddRoadmapNode = () => {
    if(!newRoadmapNode.title) return;
    setStudentRoadmap([...studentRoadmap, { id: Date.now().toString(), ...newRoadmapNode }]);
    setNewRoadmapNode({ title: '', status: 'locked', color: 'var(--text-tertiary)' });
  };

  // ----- Inside Student Details View -----
  if (selectedStudent) {
    const completedWorks = studentWorks.filter(w => w.isCompleted);
    const pendingWorks = studentWorks.filter(w => !w.isCompleted);
    
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Class
        </button>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{selectedStudent.personalInfo?.username || 'Unnamed Student'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{selectedStudent.email}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className={`btn ${studentTab === 'personal' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudentTab('personal')}>Personal Info</button>
          <button className={`btn ${studentTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudentTab('progress')}>View Progress</button>
          <button className={`btn ${studentTab === 'works' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudentTab('works')}>View Works</button>
          <button className={`btn ${studentTab === 'roadmap' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStudentTab('roadmap')}>Manage Roadmap</button>
        </div>

        {studentTab === 'personal' && (
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Full Name:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.personalInfo?.username || '-'}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Email:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.email}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Phone:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.personalInfo?.phone || '-'}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Institution:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.personalInfo?.college || '-'}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Degree:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.personalInfo?.degree || '-'}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Year of Study:</strong> <div style={{ marginTop: '0.5rem' }}>{selectedStudent.personalInfo?.yearOfStudy || '-'}</div></div>
            </div>
          </div>
        )}

        {studentTab === 'progress' && (
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Student Progress</h3>
            {studentProgress ? (
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', flex: 1 }}>
                  <div style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{studentProgress.xp || 0}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Total XP</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', flex: 1 }}>
                  <div style={{ fontSize: '2rem', color: 'var(--warning)', fontWeight: 'bold' }}>{studentProgress.streak || 0} 🔥</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Day Streak</div>
                </div>
              </div>
            ) : <p>Loading progress...</p>}
          </div>
        )}

        {studentTab === 'works' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning)' }}>Pending Works ({pendingWorks.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingWorks.map(w => (
                  <div key={w._id} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{w.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{w.description || 'No description'}</p>
                  </div>
                ))}
                {pendingWorks.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No pending works.</p>}
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>Completed Works ({completedWorks.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {completedWorks.map(w => (
                  <div key={w._id} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', opacity: 0.7 }}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', textDecoration: 'line-through' }}>{w.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{w.description || 'No description'}</p>
                  </div>
                ))}
                {completedWorks.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No completed works yet.</p>}
              </div>
            </div>
          </div>
        )}

        {studentTab === 'roadmap' && (
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Skill Roadmap Management</h3>
              <button className="btn btn-primary" onClick={handleSaveRoadmap}>Save Changes</button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="roadmap-title" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Skill / Topic Title</label>
                <input id="roadmap-title" type="text" value={newRoadmapNode.title} onChange={(e) => setNewRoadmapNode({...newRoadmapNode, title: e.target.value})} placeholder="e.g. React Fundamentals" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label htmlFor="roadmap-status" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status</label>
                <select id="roadmap-status" value={newRoadmapNode.status} onChange={(e) => {
                  const status = e.target.value;
                  const color = status === 'completed' ? 'var(--success)' : status === 'in-progress' ? 'var(--warning)' : 'var(--text-tertiary)';
                  setNewRoadmapNode({...newRoadmapNode, status, color});
                }} style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="locked">Locked</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button className="btn btn-secondary" onClick={handleAddRoadmapNode} style={{ padding: '0.75rem 1.5rem' }}>Add Node</button>
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
                    <button onClick={() => setStudentRoadmap(studentRoadmap.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {studentRoadmap.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No roadmap nodes yet. Add one above.</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedClass) {
    const currentMentorIds = (selectedClass.mentors || []).map(m => m._id);
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => setSelectedClass(null)} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Classes
        </button>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{selectedClass.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>({selectedClass.year})</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage students and mentors for this specific class.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Mentors Section */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}><Shield size={20} color="var(--accent-primary)"/> Allotted Mentors</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mentorsDirectory.map(m => (
                <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={currentMentorIds.includes(m._id)}
                    onChange={() => toggleMentor(m._id)}
                    style={{ accentColor: 'var(--accent-primary)', width: '1.2rem', height: '1.2rem' }}
                  />
                  <span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{m.personalInfo?.username || 'Unnamed'}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>({m.email}) - {m.role}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Students & CSV Section */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}><Users size={20} color="var(--accent-primary)"/> Add Students</h3>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border-color)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload a CSV file with columns: <code>email, username</code>.</p>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} id="csv-upload" />
              <label htmlFor="csv-upload" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Upload size={16} /> Select CSV File
              </label>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 'bold' }}>Or Add Manually:</p>
              <form onSubmit={handleManualAdd} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label htmlFor="student-email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email*</label>
                  <input id="student-email" type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.3rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label htmlFor="student-name" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name</label>
                  <input id="student-name" type="text" value={manualUsername} onChange={e => setManualUsername(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.3rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Add</button>
              </form>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Enrolled Students ({students.length})</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {students.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No students enrolled yet.</p>}
              {students.map(s => (
                <div key={s._id} onClick={() => fetchStudentDetails(s)} style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{s.personalInfo?.username || 'Student'} <span style={{ color: 'var(--text-secondary)' }}>({s.email})</span></span>
                  <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>View Details</button>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  // ----- Classes List View -----
  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header-stats" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-title">Classes Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage classes, allot mentors, and upload student rosters.</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
          {editingId ? 'Edit Class' : 'Create New Class'}
        </h3>
        <form onSubmit={handleSaveClass} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="class-name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Class Name</label>
            <input id="class-name" type="text" placeholder="e.g. Section A" value={className} onChange={(e) => setClassName(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="class-year" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Academic Year</label>
            <input id="class-year" type="text" placeholder="e.g. 2024-2025" value={classYear} onChange={(e) => setClassYear(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', height: '42px' }}>
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setClassName(''); setClassYear(''); }} style={{ padding: '0.75rem 2rem', height: '42px' }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {loading ? <p>Loading classes...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {classesList.map(cls => (
            <div key={cls._id} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{cls.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>{cls.year}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setEditingId(cls._id); setClassName(cls.name); setClassYear(cls.year); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                  <button onClick={() => requestDeleteClass(cls._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16}/></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  <Users size={16} /> {cls.studentCount || 0} Students
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  <Shield size={16} /> {cls.mentors?.length || 0} Mentors
                </div>
              </div>

              <button className="btn btn-secondary" onClick={() => fetchClassDetails(cls)} style={{ marginTop: 'auto', width: '100%' }}>
                Manage Class <UserPlus size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          ))}
          {classesList.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No classes created yet.</p>}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Delete Class?"
        message="Are you sure you want to delete this class? All assigned students will be unassigned from this class. This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteClass}
        onCancel={() => {
          setConfirmModalOpen(false);
          setClassToDelete(null);
        }}
      />
    </div>
  );
};

export default ClassesManagement;
