import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Target, 
  Briefcase, 
  Award, 
  User, 
  Settings,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'career-gps', icon: Map, label: 'Career GPS', badge: 'New' },
    { id: 'skill-analysis', icon: BrainCircuit, label: 'Skill Gap Heatmap' },
    { id: 'company-match', icon: Target, label: 'Company Match' },
    { id: 'recruiter', icon: MessageSquare, label: 'Recruiter Mode', badge: 'Live' },
    { id: 'viva-practice', icon: BrainCircuit, label: 'Viva Practice', badge: 'AI' },
    { id: 'badges', icon: Award, label: 'Achievements' },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <TrendingUp size={28} />
        </div>
        <div className="sidebar-title">NXTAGENT</div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Main Menu</div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <item.icon className="nav-icon" size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.65rem',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-section" style={{ marginTop: 'auto', marginBottom: '1rem' }}>
        <ul className="nav-list">
          <li
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setIsMobileMenuOpen(false);
            }}
          >
            <User className="nav-icon" size={20} />
            <span>Profile</span>
          </li>
          <li
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
          >
            <Settings className="nav-icon" size={20} />
            <span>Settings</span>
          </li>
        </ul>
      </div>

      <div className="upgrade-card">
        <Sparkles size={24} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem auto' }} />
        <div className="upgrade-title">NXTAGENT Pro</div>
        <div className="upgrade-desc">Unlock unlimited AI mock interviews & advanced analytics.</div>
        <button className="upgrade-btn">Upgrade Now</button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
