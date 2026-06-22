import React, { useState } from 'react';
import { Bell, Moon, Sun, Search, LogOut, User as UserIcon, Settings, ArrowLeft, Menu, Target, CheckCircle } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ onLogout, onBack, showBack, toggleMobileMenu, onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="topbar" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
      <div className="topbar-left" style={{ flex: 1 }}>
        {showBack && (
          <button className="action-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
        )}
        <button className="action-btn mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={20} />
        </button>
        
      </div>

      <div className="topbar-center" style={{ display: 'flex', gap: '2rem', fontWeight: '500', fontSize: '0.9rem' }}>
        <div onClick={() => onNavigate('dashboard')} style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '0.5rem', cursor: 'pointer' }}>Dashboard</div>
      </div>

      <div className="topbar-right" style={{ flex: 1, justifyContent: 'flex-end', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <button className="action-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="notification-dot" style={{ background: 'var(--accent-primary)' }}></span>
          </button>
          {showNotifications && (
            <div className="dropdown-menu notifications-menu animate-fade-in">
              <div className="dropdown-header">Notifications</div>
              <div className="dropdown-item" onClick={() => { onNavigate('important-links'); setShowNotifications(false); }} style={{ cursor: 'pointer' }}>
                <span className="dropdown-item-title">Important Links</span>
                <span className="dropdown-item-desc">Don't forget to check out today's important links!</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-widget-container" style={{ position: 'relative' }}>
          <div className="profile-widget" onClick={() => setShowProfile(!showProfile)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <UserIcon size={20} color="var(--text-primary)" />
          </div>
          {showProfile && (
            <div className="dropdown-menu profile-menu animate-fade-in">
              <div className="dropdown-item" onClick={() => { onNavigate('profile'); setShowProfile(false); }}><UserIcon size={16}/> My Profile</div>
              <div className="dropdown-item" onClick={() => { onNavigate('settings'); setShowProfile(false); }}><Settings size={16}/> Settings</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item text-error" onClick={onLogout}><LogOut size={16}/> Logout</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
