import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Dashboard from './components/Dashboard/Dashboard';
import CareerGPS from './components/Dashboard/CareerGPS';
import SkillGap from './components/Dashboard/SkillGap';
import DreamCompany from './components/Dashboard/DreamCompany';
import RecruiterMode from './components/Dashboard/RecruiterMode';
import AchievementBadges from './components/Dashboard/AchievementBadges';
import Profile from './components/Dashboard/Profile';
import VivaFlow from './components/Viva/VivaFlow';
import AnalysisReport from './components/Viva/AnalysisReport';
import Login from './components/Auth/Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState([]);
  const [reportContext, setReportContext] = useState(null); // { subject, unit }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateToTab = (newTab) => {
    if (typeof newTab === 'function') {
      // Handle functional updates if any
      setActiveTab((prev) => {
        const next = newTab(prev);
        if (next !== prev) setHistory((h) => [...h, prev]);
        return next;
      });
    } else if (newTab !== activeTab) {
      setHistory((prev) => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevTab = newHistory.pop();
      setHistory(newHistory);
      setActiveTab(prevTab);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const handleViewReport = (subject, unit) => {
    setReportContext({ subject, unit });
    navigateToTab('view-report');
  };

  const handleReturnFromReport = () => {
    setReportContext(null);
    navigateToTab('viva-practice');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigateToTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Render main content based on activeTab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={navigateToTab} />;
      case 'career-gps':
        return <div className="standalone-page"><CareerGPS /></div>;
      case 'skill-analysis':
        return <div className="standalone-page"><SkillGap /></div>;
      case 'company-match':
        return <div className="standalone-page"><DreamCompany /></div>;
      case 'recruiter':
        return <div className="standalone-page"><RecruiterMode /></div>;
      case 'badges':
        return <div className="standalone-page"><AchievementBadges /></div>;
      case 'viva-practice':
        return <VivaFlow onViewReport={handleViewReport} />;
      case 'view-report':
        return (
          <AnalysisReport
            subject={reportContext?.subject}
            unit={reportContext?.unit}
            onReturnHome={handleReturnFromReport}
          />
        );
      case 'profile':
        return <div className="standalone-page"><Profile /></div>;
      case 'settings':
        return <div className="standalone-page placeholder-page"><h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon...</h2></div>;
      default:
        return <Dashboard setActiveTab={navigateToTab} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={navigateToTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="main-content">
        <TopBar 
          onLogout={handleLogout} 
          onBack={handleBack} 
          showBack={activeTab !== 'dashboard'} 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
