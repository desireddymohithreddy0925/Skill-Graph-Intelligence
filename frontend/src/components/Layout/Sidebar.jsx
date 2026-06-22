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
  MessageSquare,
  Network,
  BarChart2,
  FileQuestion,
  ClipboardList,
  Code2,
  Video,
  FileText,
  CalendarCheck,
  LifeBuoy,
  LogOut,
  Link as LinkIcon,
  Users
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, user, onLogout }) => {
  const mainNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: ['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role) ? 'Directory' : 'Skill Intelligence' },
    { id: 'classes', icon: Users, label: 'Classes', hideForStaff: false, showOnlyForStaff: true },
    { id: 'career-gps', icon: Map, label: 'Career GPS', hideForStaff: true },
    { id: 'skill-roadmap', icon: Network, label: 'Skill Roadmap' },
    { id: 'company-match', icon: Briefcase, label: 'Dream Company', hideForStaff: true },
    { id: 'important-links', icon: LinkIcon, label: 'Important Links' },
  ];

  const practiceItems = [
    { id: 'assessments', icon: ClipboardList, label: 'Assessments' },
    { id: 'coding', icon: Code2, label: 'Coding Approaches' },
  ];

  const careerItems = [
    { id: 'resume', icon: FileText, label: 'Resume Builder', hideForStaff: true },
    { id: 'skill-t-meter', icon: Sparkles, label: 'Skill T Meter', badge: 'NEW' },
    { id: 'your-projects', icon: Code2, label: user?.role === 'mentor' ? 'All Projects' : 'Your Projects', hideForRoles: ['admin', 'sub admin', 'manager'] },
    { id: 'attendance', icon: CalendarCheck, label: 'Attendance', hideForStaff: true },
    { id: 'support', icon: LifeBuoy, label: 'Support' },
  ];

  const filterItems = (items) => {
    return items.filter(item => {
      if (user?.role === 'skill t team') {
        if (item.id !== 'skill-t-meter' && item.id !== 'settings') return false;
      }
      if (user?.role === 'support team') {
        if (item.id !== 'support' && item.id !== 'settings') return false;
      }
      if (item.showOnlyForStaff && !['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role)) return false;
      if (['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role) && item.hideForStaff) return false;
      if (item.hideForRoles && item.hideForRoles.includes(user?.role)) return false;
      return true;
    });
  };

  const renderNavList = (items) => (
    <ul className="nav-list">
      {items.map((item) => (
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
              color: 'var(--bg-primary)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: '700'
            }}>
              {item.badge}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

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
          <Network size={28} color="var(--accent-primary)" />
        </div>
        <div className="sidebar-title-container">
          <div className="sidebar-title" style={{ color: 'var(--accent-primary)', background: 'none', WebkitTextFillColor: 'initial' }}>
            {user?.role === 'admin' ? 'Skill Graph Admin' : 
             user?.role === 'sub admin' ? 'Skill Graph Subadmin' : 
             user?.role === 'manager' ? 'Skill Graph Manager' : 
             user?.role === 'skill t team' ? 'Skill Graph T' : 
             user?.role === 'support team' ? 'Skill Graph Support' : 
             user?.role === 'mentor' ? 'Skill Graph Mentor' : 
             'Skill Graph'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '0.05em', fontWeight: '600' }}>INSIGHTFUL STRATEGIST</div>
        </div>
      </div>

      <div className="sidebar-scrollable">
        <div className="nav-section">
          {renderNavList(filterItems(mainNavItems))}
        </div>

        <div className="nav-section">
          {renderNavList(filterItems(practiceItems))}
        </div>

        <div className="nav-section">
          {renderNavList(filterItems(careerItems))}
        </div>
      </div>

      <div className="nav-section" style={{ marginTop: 'auto', marginBottom: '1rem' }}>
        {!['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role) && (
          <div className="upgrade-card" style={{ marginBottom: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '1rem' }}>
            <div className="upgrade-title" style={{ color: 'var(--accent-primary)' }}>Upgrade to Pro</div>
            <div className="upgrade-desc" style={{ fontSize: '0.7rem' }}>Unlock AI-powered path optimization.</div>
            <button className="btn btn-primary" onClick={() => setActiveTab('settings')} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>Upgrade Now</button>
          </div>
        )}

        <ul className="nav-list">
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
          <li className="nav-item text-error" onClick={onLogout}>
            <LogOut className="nav-icon" size={20} />
            <span>Log out</span>
          </li>
        </ul>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
