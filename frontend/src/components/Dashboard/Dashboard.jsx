import React, { useState, useEffect } from 'react';
import PlacementReadiness from './PlacementReadiness';
import AISkillGap from './AISkillGap';
import CompetencyGraph from './CompetencyGraph';
import GamificationCenter from './GamificationCenter';
import PerformanceIntelligence from './PerformanceIntelligence';
import Loading from '../ui/Loading';
import './Dashboard.css';

const Dashboard = ({ setActiveTab, user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const userId = user?.id || user?._id;
    if (userId) fetchAssignments(userId);
  }, [user]);

  const fetchAssignments = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/assignments/student/${userId}`);
      const json = await res.json();
      if (res.ok) setAssignments(json.data || json);
    } catch (err) { console.error(err); }
  };

  const fetchDashboardData = async () => {
    try {
      const userId = user?.id || user?._id;
      const url = userId ? `${import.meta.env.VITE_BASE_URL}/api/dashboard/full?userId=${userId}` : `${import.meta.env.VITE_BASE_URL}/api/dashboard/full`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoadmapStart = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/dashboard/roadmap/start', {
        method: 'POST'
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => ({
          ...prev,
          aiSkillGap: json.aiSkillGap,
          skillRoadmap: json.skillRoadmap
        }));
      }
    } catch (error) {
      console.error("Error starting module:", error);
    }
  };

  if (loading) {
    return <Loading message="Loading Insights..." fullScreen={false} />;
  }

  if (!data) {
    return <div className="dashboard-container"><h2>Error loading data.</h2></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header Area */}
      <div className="dashboard-header-stats">
        <div>
          <h2 className="dashboard-title">Everything you need to <span className="gradient-text">Excel your placements</span>, AI Powered!</h2>
        </div>
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-label">XP POINTS</span>
            <span className="stat-value text-accent">{(data?.stats?.xp ?? user?.xp ?? 0).toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>STREAK</span>
            </span>
            <span className="stat-value text-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🔥 {data?.stats?.streak ?? user?.streak ?? 0} Days</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        <div className="col-span-3">
          <PlacementReadiness data={data.placementReadiness} />
        </div>

        <div className="col-span-2">
          {assignments.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Assigned Tasks ({assignments.filter(a => !a.isCompleted).length} Pending)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assignments.map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', opacity: a.isCompleted ? 0.6 : 1 }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{a.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{a.description}</p>
                      <small style={{ color: 'var(--text-tertiary)' }}>Assigned by {a.mentorId?.personalInfo?.username || 'Mentor'}</small>
                    </div>
                    {!a.isCompleted && (
                      <button className="btn btn-primary" onClick={async () => {
                        try {
                          await fetch(`${import.meta.env.VITE_BASE_URL}/api/assignments/${a._id}/complete`, { method: 'PUT' });
                          fetchAssignments();
                        } catch (err) { console.error(err); }
                      }}>Complete</button>
                    )}
                    {a.isCompleted && <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Done ✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <AISkillGap data={data.aiSkillGap} onStartModule={handleRoadmapStart} />
        </div>
        <div className="col-span-1">
          <CompetencyGraph data={data.competencyGraph} />
        </div>

        <div className="col-span-2">
          <GamificationCenter data={data.gamification} stats={data.stats} />
        </div>
        <div className="col-span-1">
          <PerformanceIntelligence data={data.performanceIntelligence} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
