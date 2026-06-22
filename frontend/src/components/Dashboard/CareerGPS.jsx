import React, { useState, useEffect } from 'react';
import Loading from '../ui/Loading';
import { MapPin, Check, Briefcase, GraduationCap, Building } from 'lucide-react';
import { DashboardAPI } from '../../api/client';
import './CareerGPS.css';

const CareerGPS = () => {
  const [tasks, setTasks] = useState(null);
  const [dreamCompany, setDreamCompany] = useState('Google');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await DashboardAPI.getCareerGPS();
        setTasks(response.tasks);
        setDreamCompany(response.dreamCompany || 'Google');
      } catch (err) {
        console.error('Failed to load GPS tasks perfectly', err);
      }
    };
    loadTasks();
  }, []);

  const toggleTask = async (key) => {
    // Optimistic UI update
    setTasks(prev => ({ ...prev, [key]: !prev[key] }));
    try {
      await DashboardAPI.toggleCareerGPSTask(key);
    } catch (err) {
      // Revert on failure
      setTasks(prev => ({ ...prev, [key]: !prev[key] }));
      console.error('Failed to perfectly toggle task', err);
    }
  };

  if (!tasks) return <Loading message="Loading GPS..." />;

  const completedCount = Object.values(tasks).filter(Boolean).length;
  const totalTasks = Object.keys(tasks).length;
  
  // Calculate states dynamically
  const isNeedToLearnCurrent = completedCount < totalTasks;
  const isBuildProjectsCurrent = completedCount === totalTasks;

  return (
    <div className="career-gps-container animate-fade-in">
      <div className="gps-header">
        <MapPin size={28} color="var(--accent-primary)" />
        <h2 className="gps-title">Career GPS</h2>
      </div>

      <div className="gps-timeline">
        {/* Node 1: Current Position */}
        <div className="gps-node completed">
          <div className="node-marker">
            <Check size={14} />
          </div>
          <div className="node-content">
            <div className="node-title">
              Current Position
              <GraduationCap size={20} color="var(--text-tertiary)" />
            </div>
            <div className="node-subtitle">3rd Year CSE Student</div>
          </div>
        </div>

        {/* Node 2: Need to Learn */}
        <div className={`gps-node ${isNeedToLearnCurrent ? 'current' : 'completed'}`}>
          <div className="node-marker">
            {isNeedToLearnCurrent ? <div style={{width: 8, height: 8, background: 'white', borderRadius: '50%'}} /> : <Check size={14} />}
          </div>
          <div className="node-content">
            <div className="node-title">Need to Learn</div>
            <div className="node-subtitle">Core fundamentals for technical interviews</div>
            
            <div className="task-list">
              <div className={`task-item ${tasks.dsa ? 'completed' : ''}`} onClick={() => toggleTask('dsa')}>
                <div className="task-checkbox">{tasks.dsa && <Check size={12} />}</div>
                <span className="task-label">Data Structures & Algorithms (DSA)</span>
              </div>
              <div className={`task-item ${tasks.dbms ? 'completed' : ''}`} onClick={() => toggleTask('dbms')}>
                <div className="task-checkbox">{tasks.dbms && <Check size={12} />}</div>
                <span className="task-label">Database Management Systems (DBMS)</span>
              </div>
              <div className={`task-item ${tasks.oop ? 'completed' : ''}`} onClick={() => toggleTask('oop')}>
                <div className="task-checkbox">{tasks.oop && <Check size={12} />}</div>
                <span className="task-label">Object-Oriented Programming (OOP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node 3: Build Projects */}
        <div className={`gps-node ${isBuildProjectsCurrent ? 'current' : 'future'}`}>
          <div className="node-marker">
             {isBuildProjectsCurrent ? <div style={{width: 8, height: 8, background: 'white', borderRadius: '50%'}} /> : null}
          </div>
          <div className="node-content">
            <div className="node-title">
              Build Projects
              <Briefcase size={20} color="var(--text-tertiary)" />
            </div>
            <div className="node-subtitle">Apply your knowledge in real-world scenarios</div>
          </div>
        </div>

        {/* Node 4: Mock Interview */}
        <div className="gps-node future">
          <div className="node-marker"></div>
          <div className="node-content">
            <div className="node-title">Mock Interview</div>
            <div className="node-subtitle">Practice with AI Recruiter</div>
          </div>
        </div>

        {/* Node 5: Dream Company */}
        <div className="gps-node future">
          <div className="node-marker" style={{ borderColor: 'var(--accent-primary)' }}>
            <Building size={12} color="var(--accent-primary)" />
          </div>
          <div className="node-content dream-company-node">
            <div className="node-title dream-company-title">Dream Company</div>
            <div className="node-subtitle" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{dreamCompany}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGPS;
