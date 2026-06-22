import React, { useState, useEffect } from 'react';
import { User, Edit2, Mail, Phone, Calendar, MapPin, Building, GraduationCap, Award, BookOpen, Link, Code2, Search, Check, X } from 'lucide-react';
import './Profile.css';

const Profile = ({ user, onUpdateUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Edit Mode States
  const [editSection, setEditSection] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (['admin', 'sub admin', 'manager'].includes(user?.role)) {
      setLoading(false); // Admin starts in search view
    } else if (user?.email) {
      fetchProfile(user.email);
    }
  }, [user]);

  const fetchProfile = async (email, isStudentSelection = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${email}`);
      const data = await res.json();
      if (res.ok) {
        if (isStudentSelection) {
          setSelectedStudent(data);
        } else {
          setProfileData(data);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (section, currentData) => {
    setEditSection(section);
    if (section === 'personalInfo') {
      // Include root-level email in the form data so it can be edited
      setFormData({ ...currentData, email: profileData?.email });
    } else {
      setFormData(currentData || {});
    }
  };

  const handleSave = async (sectionKey) => {
    try {
      const res = await fetch(`/api/profile/${profileData?.email || user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey, data: formData })
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        setEditSection(null);
        if (onUpdateUser && sectionKey === 'personalInfo') {
          onUpdateUser({ email: updated.email, username: updated.personalInfo?.username });
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  if (loading && !searchResults.length && !profileData && !selectedStudent) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  // ---- ADMIN VIEW ----
  if (['admin', 'sub admin', 'manager'].includes(user?.role)) {
    return (
      <div className="profile-container animate-fade-in">
        <div className="profile-header-breadcrumb">
          <Search size={18} />
          <span>User Directory</span>
        </div>

        {!selectedStudent ? (
          <div className="profile-card">
            <h3>Search Students</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input 
                type="text" 
                placeholder="Search by username or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>

            {searchResults.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h4>Results ({searchResults.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {searchResults.map(student => (
                    <div 
                      key={student._id} 
                      style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => fetchProfile(student.email, true)}
                    >
                      <div>
                        <strong>{student.personalInfo?.username || student.email}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Roll: {student.personalInfo?.rollNumber || 'N/A'}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm">View Profile</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)} style={{ marginBottom: '1rem' }}>
              &larr; Back to Search
            </button>
            <StudentProfileView data={selectedStudent} />
          </div>
        )}
      </div>
    );
  }

  // ---- STUDENT VIEW ----
  const data = profileData || {};
  const personalInfo = data.personalInfo || {};
  const socialProfile = data.socialProfile || {};
  const codingProfiles = data.codingProfiles || {};

  const renderEditForm = (sectionKey, fields) => (
    <div className="profile-edit-form">
      {fields.map(field => (
        <div className="form-group" key={field.key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{field.label}</label>
          <input 
            type="text" 
            value={formData[field.key] || ''} 
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)' }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={() => handleSave(sectionKey)}><Check size={16}/> Save</button>
        <button className="btn btn-secondary" onClick={() => setEditSection(null)}><X size={16}/> Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header-breadcrumb">
        <User size={18} />
        <span>My Profile</span>
      </div>

      {/* Personal Information */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Personal Information</h3>
          {editSection !== 'personalInfo' && (
            <button className="btn-edit" onClick={() => handleEditClick('personalInfo', personalInfo)}>
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>
        {editSection === 'personalInfo' ? (
          renderEditForm('personalInfo', [
            { key: 'email', label: 'Email Address' },
            { key: 'username', label: 'Username' },
            { key: 'institute', label: 'Institute' },
            { key: 'rollNumber', label: 'Roll Number' },
            { key: 'phoneNumber', label: 'Phone Number' },
            { key: 'department', label: 'Department' },
            { key: 'passoutYear', label: 'Passout Year' },
            { key: 'gender', label: 'Gender' },
          ])
        ) : (
          <div className="profile-grid">
            <InfoItem icon={<User size={14}/>} label="Username" value={personalInfo.username} />
            <InfoItem icon={<Mail size={14}/>} label="Email" value={data.email} />
            <InfoItem icon={<Building size={14}/>} label="Institute" value={personalInfo.institute} />
            <InfoItem icon={<BookOpen size={14}/>} label="Roll Number" value={personalInfo.rollNumber} />
            <InfoItem icon={<Phone size={14}/>} label="Phone Number" value={personalInfo.phoneNumber} />
            <InfoItem icon={<GraduationCap size={14}/>} label="Department" value={personalInfo.department} />
            <InfoItem icon={<Calendar size={14}/>} label="Passout Year" value={personalInfo.passoutYear} />
            <InfoItem icon={<User size={14}/>} label="Gender" value={personalInfo.gender} />
          </div>
        )}
      </div>

      {/* Social Profile */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Social Profile</h3>
          {editSection !== 'socialProfile' && (
            <button className="btn-edit" onClick={() => handleEditClick('socialProfile', socialProfile)}>
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>
        {editSection === 'socialProfile' ? (
          renderEditForm('socialProfile', [
            { key: 'githubUrl', label: 'GitHub URL' },
            { key: 'linkedInUrl', label: 'LinkedIn URL' },
          ])
        ) : (
          <div className="profile-grid">
            <InfoItem icon={<Link size={14}/>} label="GitHub" value={socialProfile.githubUrl} />
            <InfoItem icon={<Link size={14}/>} label="LinkedIn" value={socialProfile.linkedInUrl} />
          </div>
        )}
      </div>

      {/* Coding Platforms */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Coding Platforms</h3>
          {editSection !== 'codingProfiles' && (
            <button className="btn-edit" onClick={() => handleEditClick('codingProfiles', codingProfiles)}>
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>
        {editSection === 'codingProfiles' ? (
          renderEditForm('codingProfiles', [
            { key: 'leetcode', label: 'LeetCode Username' },
            { key: 'hackerrank', label: 'HackerRank Username' },
            { key: 'codechef', label: 'CodeChef Username' },
            { key: 'codeforces', label: 'CodeForces Username' },
            { key: 'atcoder', label: 'AtCoder Username' },
          ])
        ) : (
          <div className="profile-grid">
            <InfoItem icon={<Code2 size={14}/>} label="LeetCode" value={codingProfiles.leetcode} />
            <InfoItem icon={<Code2 size={14}/>} label="HackerRank" value={codingProfiles.hackerrank} />
            <InfoItem icon={<Code2 size={14}/>} label="CodeChef" value={codingProfiles.codechef} />
            <InfoItem icon={<Code2 size={14}/>} label="CodeForces" value={codingProfiles.codeforces} />
            <InfoItem icon={<Code2 size={14}/>} label="AtCoder" value={codingProfiles.atcoder} />
          </div>
        )}
      </div>

    </div>
  );
};

// Helper components
const InfoItem = ({ icon, label, value }) => (
  <div className="info-item">
    <div className="info-label">{icon} {label}</div>
    <div className="info-value">{value || <span style={{color: 'var(--text-tertiary)', fontStyle: 'italic'}}>Not provided</span>}</div>
  </div>
);

// Read-only view for Admin
const StudentProfileView = ({ data }) => {
  const p = data.personalInfo || {};
  const s = data.socialProfile || {};
  const c = data.codingProfiles || {};

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Profile: {p.username || data.email}</h2>
      
      <div className="profile-card">
        <h3>Personal Information</h3>
        <div className="profile-grid" style={{ marginTop: '1rem' }}>
          <InfoItem icon={<Mail size={14}/>} label="Email" value={data.email} />
          <InfoItem icon={<BookOpen size={14}/>} label="Roll Number" value={p.rollNumber} />
          <InfoItem icon={<Building size={14}/>} label="Institute" value={p.institute} />
          <InfoItem icon={<GraduationCap size={14}/>} label="Department" value={p.department} />
          <InfoItem icon={<Phone size={14}/>} label="Phone Number" value={p.phoneNumber} />
        </div>
      </div>

      <div className="profile-card">
        <h3>Social & Coding</h3>
        <div className="profile-grid" style={{ marginTop: '1rem' }}>
          <InfoItem icon={<Link size={14}/>} label="GitHub" value={s.githubUrl} />
          <InfoItem icon={<Link size={14}/>} label="LinkedIn" value={s.linkedInUrl} />
          <InfoItem icon={<Code2 size={14}/>} label="LeetCode" value={c.leetcode} />
          <InfoItem icon={<Code2 size={14}/>} label="CodeChef" value={c.codechef} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
