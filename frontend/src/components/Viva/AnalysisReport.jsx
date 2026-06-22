import React, { useState, useEffect } from 'react';
import Loading from '../ui/Loading';
import { ChevronLeft, ChevronRight, TrendingUp, Info, Home, BarChart3, X } from 'lucide-react';
import './AnalysisReport.css';

// --- Donut Chart Component ---
const DonutChart = ({ score, size = 120, strokeWidth = 10, color = '#10b981' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

const ScoreRing = ({ score, label, size = 140, color = '#10b981' }) => (
  <div className="score-ring-wrap">
    <div style={{ position: 'relative', width: size, height: size }}>
      <DonutChart score={score} size={size} strokeWidth={12} color={color} />
      <div className="ring-label-center">
        <span className="ring-score">{score}</span>
        <span className="ring-denom">/100</span>
      </div>
    </div>
    {label && <div className="ring-title">{label}</div>}
  </div>
);

const SmallRing = ({ score, color = '#10b981' }) => (
  <div style={{ position: 'relative', width: 80, height: 80 }}>
    <DonutChart score={score} size={80} strokeWidth={8} color={color} />
    <div className="ring-label-center" style={{ fontSize: '0.8rem' }}>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{score}</span>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>/100</span>
    </div>
  </div>
);

// Data is now fetched dynamically

const overallSidebarItems = [
  {
    title: 'Domain Knowledge',
    desc: 'Evaluates your technical expertise by examining your proficiency in specific skills or knowledge related to a particular subject or field.',
    scores: [
      { label: 'Overall Technical Score', score: 85, color: '#10b981' },
      { label: 'Technical Term Match Score', score: 89, color: '#10b981' },
    ],
  },
];

import { VivaAPI } from '../../api/client';

const AnalysisReport = ({ sessionId = 'mock_session_1', onReturnHome }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' | 'overall'
  const [mockData, setMockData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await VivaAPI.getReport(sessionId);
        setMockData(response.report);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  if (loading) return <div className="analysis-report-container"><Loading message="Loading Report..." /></div>;
  if (!mockData) return <div>No report found.</div>;

  const currentQ = mockData.questions[currentQIndex];
  const totalQ = mockData.questions.length;

  const handlePrev = () => setCurrentQIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1));

  return (
    <div className="ar-container animate-fade-in">
      {/* Header */}
      <div className="ar-header">
        <div className="ar-header-left">
          <button className="ar-back-btn" onClick={onReturnHome}>
            <Home size={16} /> My Practice
          </button>
          <ChevronRight size={14} className="ar-header-sep" />
          <span className="ar-header-active">Area of Improvements</span>
        </div>
      </div>

      {/* Title */}
      <div className="ar-title-section">
        <h2 className="ar-main-title">{mockData.title}</h2>
        <p className="ar-submitted-at">{mockData.submittedAt}</p>
      </div>

      {/* Main Content */}
      <div className="ar-body">
        {/* Left / Main Panel */}
        <div className="ar-main-panel">
          {/* Tab bar */}
          <div className="ar-tab-bar">
            <button
              className={`ar-tab ${activeTab === 'technical' ? 'active' : ''}`}
              onClick={() => setActiveTab('technical')}
            >
              <BarChart3 size={16} /> Question Wise Analytics
            </button>
          </div>

          {/* Question Navigation */}
          <div className="ar-q-nav">
            <span className="ar-q-nav-title">Question Wise Analytics</span>
            <div className="ar-q-nav-btns">
              <button className="ar-nav-btn" onClick={handlePrev} disabled={currentQIndex === 0}>
                <ChevronLeft size={16} /> Prev Q
              </button>
              <button className="ar-nav-btn" onClick={handleNext} disabled={currentQIndex === totalQ - 1}>
                Next Q <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Question Progress Dots */}
          <div className="ar-q-dots">
            {mockData.questions.map((_, i) => (
              <button
                key={i}
                className={`ar-q-dot ${i === currentQIndex ? 'active' : i < currentQIndex ? 'done' : ''}`}
                onClick={() => setCurrentQIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Technical Analysis Section */}
          <div className="ar-section-card">
            <div className="ar-section-header">
              <h3>Technical Analysis</h3>
              <p>This part helps you understand how strong your technical knowledge is for each question.</p>
            </div>

            {/* 3 Score Rings */}
            <div className="ar-scores-row">
              <div className="ar-score-block">
                <ScoreRing score={currentQ.technicalScore} label="Technical Score" color="#10b981" />
                <p className="ar-score-desc">This shows how technically correct your answer is overall.</p>
              </div>
              <div className="ar-score-block">
                <ScoreRing score={currentQ.termMatchScore} label="Technical Term Match Score" color="#10b981" />
                <p className="ar-score-desc">How well you used relevant technical terminology.</p>
              </div>
              <div className="ar-score-block">
                <ScoreRing score={currentQ.relevanceScore} label="Content Relevance Score" color="#10b981" />
                <p className="ar-score-desc">How closely your answer stayed on topic.</p>
              </div>
            </div>
          </div>

          {/* Transcript & Feedback */}
          <div className="ar-section-card">
            <h3 className="ar-section-label">Question</h3>
            <p className="ar-question-text">Q{currentQIndex + 1}: {currentQ.q}</p>

            <div className="ar-feedback-grid">
              <div className="ar-feedback-box transcript">
                <div className="ar-box-title">🎤 Your Transcript</div>
                <p>"{currentQ.transcript}"</p>
              </div>
              <div className="ar-feedback-box perceived">
                <div className="ar-box-title">🧠 How it was Perceived</div>
                <p>{currentQ.perceived}</p>
              </div>
              <div className="ar-feedback-box gaps">
                <div className="ar-box-title">⚠️ Gaps in Answer</div>
                <p>{currentQ.gaps}</p>
                <div className="ar-box-title" style={{ marginTop: '0.75rem' }}>💬 Communication Analysis</div>
                <p>{currentQ.commAnalysis}</p>
              </div>
              <div className="ar-feedback-box improve">
                <div className="ar-box-title">📈 How to Improve</div>
                <p>{currentQ.improve}</p>
              </div>
            </div>
          </div>

          <div className="ar-actions">
            <button className="btn btn-secondary" onClick={onReturnHome}>
              <Home size={16} /> Back to Practice
            </button>
            <button className="btn btn-primary" onClick={onReturnHome}>
              Retake Test <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right / Overall Analytics Sidebar */}
        <div className="ar-sidebar">
          <div className="ar-sidebar-title">
            <BarChart3 size={18} /> Overall Analytics
          </div>

          {overallSidebarItems.map((item, i) => (
            <div key={i} className="ar-sidebar-card">
              <div className="ar-sidebar-card-title">{item.title}</div>
              <p className="ar-sidebar-card-desc">{item.desc}</p>

              {item.scores.map((s, j) => (
                <div key={j} className="ar-sidebar-score-row">
                  <div className="ar-sidebar-score-label">
                    {s.label} <Info size={12} style={{ opacity: 0.5 }} />
                    <button className="ar-collapse-btn">∧</button>
                  </div>
                  <div className="ar-sidebar-ring-wrap">
                    <SmallRing score={s.score} color={s.color} />
                    <p className="ar-sidebar-ring-desc">
                      To take it to the next level, integrate multiple technical terms that are logically connected, demonstrating deep understanding.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Overall score summary */}
          <div className="ar-sidebar-card">
            <div className="ar-sidebar-card-title">Overall Scores</div>
            <div className="ar-overall-grid">
              <div className="ar-overall-item">
                <SmallRing score={mockData.overall.technicalScore} color="#10b981" />
                <span>Technical</span>
              </div>
              <div className="ar-overall-item">
                <SmallRing score={mockData.overall.termMatchScore} color="#10b981" />
                <span>Term Match</span>
              </div>
              <div className="ar-overall-item">
                <SmallRing score={mockData.overall.relevanceScore} color="#3b82f6" />
                <span>Relevance</span>
              </div>
              <div className="ar-overall-item">
                <SmallRing score={mockData.overall.confidenceScore} color="#f59e0b" />
                <span>Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
