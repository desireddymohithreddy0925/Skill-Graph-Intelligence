import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Search, LogOut, User as UserIcon, Settings, ArrowLeft, Menu } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ onLogout, onBack, showBack, toggleMobileMenu }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Default mode is day mode, removed window.matchMedia check

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {showBack && (
          <button className="action-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
        )}
        <button className="action-btn mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={20} />
        </button>
        <h1 className="greeting">Welcome back, Mohith! 👋</h1>
        <div className="company-selector-wrapper">
          <select className="company-select">
            <option value="google">Target: Google</option>
            <option value="microsoft">Target: Microsoft</option>
            <option value="amazon">Target: Amazon</option>
            <option value="meta">Target: Meta</option>
            <option value="general">Target: General Tech</option>
          </select>
        </div>
      </div>

      <div className="topbar-right">
        <button className="action-btn">
          <Search size={20} />
        </button>
        <button className="action-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div style={{ position: 'relative' }}>
          <button className="action-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          {showNotifications && (
            <div className="dropdown-menu notifications-menu animate-fade-in">
              <div className="dropdown-header">Notifications</div>
              <div className="dropdown-item">
                <span className="dropdown-item-title">New Badge Earned!</span>
                <span className="dropdown-item-desc">You just unlocked "Interview Ready".</span>
              </div>
              <div className="dropdown-item">
                <span className="dropdown-item-title">System Update</span>
                <span className="dropdown-item-desc">Dark mode visuals have been improved.</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-widget-container" style={{ position: 'relative' }}>
          <div className="profile-widget" onClick={() => setShowProfile(!showProfile)}>
            <div className="profile-avatar">M</div>
            <div className="profile-info">
              <span className="profile-name">Mohith Reddy</span>
              <span className="profile-role">3rd Year CSE</span>
            </div>
          </div>
          {showProfile && (
            <div className="dropdown-menu profile-menu animate-fade-in">
              <div className="dropdown-item"><UserIcon size={16}/> My Profile</div>
              <div className="dropdown-item"><Settings size={16}/> Settings</div>
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
