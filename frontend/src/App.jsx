import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Dashboard from './components/Dashboard/Dashboard';
import StaffDashboard from './components/Dashboard/StaffDashboard';
import CareerGPS from './components/Dashboard/CareerGPS';
import SkillGap from './components/Dashboard/SkillGap';
import DreamCompany from './components/Dashboard/DreamCompany';
import RecruiterMode from './components/Dashboard/RecruiterMode';
import AchievementBadges from './components/Dashboard/AchievementBadges';
import Profile from './components/Dashboard/Profile';
import VivaFlow from './components/Viva/VivaFlow';
import AnalysisReport from './components/Viva/AnalysisReport';
import Login from './components/Auth/Login';
import YourProjects from './components/Dashboard/YourProjects';
import SkillRoadmap from './components/Dashboard/SkillRoadmap';
import SkillTMeter from './components/Dashboard/SkillTMeter';
import AudienceView from './components/SkillTMeter/AudienceView';

import ComingSoon from './components/Dashboard/ComingSoon';
import AssessmentsList from './components/Assessments/AssessmentsList';
import CreateAssessment from './components/Assessments/CreateAssessment';
import TakeAssessment from './components/Assessments/TakeAssessment';
import AssessmentResults from './components/Assessments/AssessmentResults';
import ImportantLinks from './components/Dashboard/ImportantLinks';
import Support from './components/Dashboard/Support';
import CodingApproaches from './components/CodingApproaches/CodingApproaches';
import ClassesManagement from './components/Dashboard/ClassesManagement';
import MentorRoadmapManagement from './components/Dashboard/MentorRoadmapManagement';
import ResumeBuilder from './components/Resume/ResumeBuilder';
import { Toaster } from 'react-hot-toast';
import ConfirmModal from './components/ui/ConfirmModal';
import { useUnsavedChanges } from './context/UnsavedChangesContext';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState([]);
  const [reportContext, setReportContext] = useState(null); // { subject, unit }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audienceJoinCode, setAudienceJoinCode] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCodeFromUrl = params.get('join');
    if (joinCodeFromUrl) {
      setAudienceJoinCode(joinCodeFromUrl);
    }
  }, []);

  const navigateToTab = (newTab) => {
    if (hasUnsavedChanges) {
      setPendingTab(() => newTab);
      setShowUnsavedModal(true);
      return;
    }
    executeNavigation(newTab);
  };

  const executeNavigation = (newTab) => {
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

  const confirmNavigation = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    if (pendingTab) {
      executeNavigation(pendingTab);
      setPendingTab(null);
    }
  };

  const cancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingTab(null);
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

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigateToTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setUser(null);
  };

  // Render main content based on activeTab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (user?.role === 'skill t team') return <div className="standalone-page"><SkillTMeter user={user} onJoin={(code) => setAudienceJoinCode(code)} /></div>;
        return ['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role) ? <StaffDashboard user={user} /> : <Dashboard setActiveTab={navigateToTab} user={user} />;
      case 'career-gps':
        return <div className="standalone-page"><CareerGPS /></div>;
      case 'skill-roadmap': 
        return ['mentor', 'admin', 'sub admin', 'manager'].includes(user?.role) 
          ? <div className="standalone-page"><MentorRoadmapManagement /></div> 
          : <div className="standalone-page"><SkillRoadmap /></div>;
      case 'skill-analysis':
        return <div className="standalone-page"><SkillGap /></div>;
      case 'company-match':
        return <div className="standalone-page"><DreamCompany /></div>;
      case 'skill-t-meter':
        return <div className="standalone-page"><SkillTMeter user={user} onJoin={(code) => setAudienceJoinCode(code)} /></div>;
      case 'your-projects':
        return <div className="standalone-page"><YourProjects user={user} /></div>;

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
        return <div className="standalone-page"><Profile user={user} onUpdateUser={(newDetails) => setUser({...user, ...newDetails})} /></div>;
      case 'directory':
        return <div className="standalone-page"><StaffDashboard user={user} /></div>;
      case 'classes':
        return <div className="standalone-page"><ClassesManagement user={user} /></div>;
      
      // Assessments and Coding
      case 'assessments': 
        return <div className="standalone-page"><AssessmentsList user={user} setActiveTab={navigateToTab} setSelectedAssessmentId={setSelectedAssessmentId} /></div>;
      case 'coding':
        return <div className="standalone-page"><CodingApproaches user={user} /></div>;
      case 'create-assessment':
        return <div className="standalone-page"><CreateAssessment user={user} setActiveTab={navigateToTab} /></div>;
      case 'take-assessment':
        return <div className="standalone-page"><TakeAssessment user={user} assessmentId={selectedAssessmentId} setActiveTab={navigateToTab} /></div>;
      case 'assessment-results':
        return <div className="standalone-page"><AssessmentResults assessmentId={selectedAssessmentId} setActiveTab={navigateToTab} /></div>;
      case 'important-links':
        return <div className="standalone-page"><ImportantLinks user={user} /></div>;

      // Placeholder Routes
      case 'mock-interviews': return <div className="standalone-page"><ComingSoon title="Mock Interviews" /></div>;
      case 'resume': return <div className="standalone-page"><ResumeBuilder user={user} /></div>;
      case 'attendance': return <div className="standalone-page"><ComingSoon title="Attendance" /></div>;
      case 'support': return <div className="standalone-page"><Support user={user} /></div>;
      case 'settings': return <div className="standalone-page"><ComingSoon title="Settings" /></div>;
      
      default:
        if (user?.role === 'skill t team') return <div className="standalone-page"><SkillTMeter user={user} onJoin={(code) => setAudienceJoinCode(code)} /></div>;
        return ['admin', 'mentor', 'sub admin', 'manager'].includes(user?.role) ? <StaffDashboard user={user} /> : <Dashboard setActiveTab={navigateToTab} user={user} />;
    }
  };

  if (audienceJoinCode) {
    return <AudienceView joinCode={audienceJoinCode} onLeave={() => setAudienceJoinCode(null)} user={user} />;
  }

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }
        }} />
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={navigateToTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <TopBar 
          onLogout={handleLogout} 
          onBack={handleBack} 
          showBack={activeTab !== 'dashboard'} 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigate={navigateToTab}
        />
        <div key={activeTab} className="page-transition-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderMainContent()}
        </div>
      </div>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }} />
      <ConfirmModal 
        isOpen={showUnsavedModal}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Yes, leave page"
        cancelText="Cancel"
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </div>
  );
}

export default App;
