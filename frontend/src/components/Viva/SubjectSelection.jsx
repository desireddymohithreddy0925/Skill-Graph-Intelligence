import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Clock, Eye, LayoutGrid, LayoutList, Play, FileText, RotateCcw, Zap } from 'lucide-react';
import { VivaAPI } from '../../api/client';
import './SubjectSelection.css';

const SubjectSelection = ({ onSelectUnit, onViewReport }) => {
  const [currentLevel, setCurrentLevel] = useState('subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [completedTopics, setCompletedTopics] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, subjectsRes] = await Promise.all([
          VivaAPI.getTopicStatus(),
          VivaAPI.getSubjects()
        ]);
        setCompletedTopics(statusRes.completedTopics || {});
        setSubjects(subjectsRes.subjects || []);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentLevel('chapters');
  };

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentLevel('topics');
  };

  const handleBreadcrumbClick = (level) => {
    if (level === 'subjects') {
      setSelectedSubject(null);
      setSelectedChapter(null);
      setCurrentLevel('subjects');
    } else if (level === 'chapters' && selectedSubject) {
      setSelectedChapter(null);
      setCurrentLevel('chapters');
    }
  };

  const getSubjectProgress = (subject) => {
    if (!subject.chapters.length) return 0;
    let total = 0, done = 0;
    subject.chapters.forEach(ch => ch.topics.forEach(t => {
      total++;
      if (completedTopics[t.title]) done++;
    }));
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  if (loading) {
    return (
      <div className="ss-loading">
        <div className="ss-spinner" />
        <p>Loading practice sessions...</p>
      </div>
    );
  }

  return (
    <div className="ss-wrapper animate-fade-in">
      {/* Breadcrumb */}
      <div className="ss-breadcrumb">
        <button className={`ss-crumb ${currentLevel === 'subjects' ? 'active' : ''}`} onClick={() => handleBreadcrumbClick('subjects')}>
          <LayoutList size={14} /> My Practice
        </button>
        {selectedSubject && (
          <>
            <ChevronRight size={14} className="ss-crumb-sep" />
            <button className={`ss-crumb ${currentLevel === 'chapters' ? 'active' : ''}`} onClick={() => handleBreadcrumbClick('chapters')}>
              {selectedSubject.title.length > 25 ? selectedSubject.title.substring(0, 25) + '…' : selectedSubject.title}
            </button>
          </>
        )}
        {selectedChapter && (
          <>
            <ChevronRight size={14} className="ss-crumb-sep" />
            <span className="ss-crumb active">
              {selectedChapter.title.length > 25 ? selectedChapter.title.substring(0, 25) + '…' : selectedChapter.title}
            </span>
          </>
        )}
      </div>

      <div className="ss-body">
        {/* Page Header */}
        <div className="ss-header">
          <div>
            <h2 className="ss-title">
              {currentLevel === 'subjects' && 'My Practice Subjects'}
              {currentLevel === 'chapters' && `${selectedSubject?.title}`}
              {currentLevel === 'topics' && `${selectedChapter?.title}`}
            </h2>
            <p className="ss-subtitle">
              {currentLevel === 'subjects' && 'Choose a subject to begin your AI-powered viva preparation'}
              {currentLevel === 'chapters' && 'Select a chapter to view its topics'}
              {currentLevel === 'topics' && 'Select a topic to start your assessment'}
            </p>
          </div>
          {currentLevel === 'subjects' && (
            <div className="ss-stats-bar">
              <div className="ss-stat-pill">
                <Zap size={14} /> {Object.keys(completedTopics).length} Tests Completed
              </div>
            </div>
          )}
        </div>

        {/* Subjects */}
        {currentLevel === 'subjects' && (
          <div className="ss-grid">
            {subjects.map(subject => {
              const progress = getSubjectProgress(subject);
              return (
                <div key={subject.id} className="ss-card subject-card" onClick={() => handleSubjectClick(subject)}>
                  <div className="ss-card-top">
                    <div className="ss-subject-icon"><BookOpen size={20} /></div>
                    <div className="ss-card-badge">{subject.chaptersCount} units</div>
                  </div>
                  <h3 className="ss-card-title">{subject.title}</h3>
                  <p className="ss-card-desc">
                    {subject.desc.length > 80 ? subject.desc.substring(0, 80) + '... ' : subject.desc}
                    {subject.desc.length > 80 && <span className="ss-show-more">Show more</span>}
                  </p>
                  <div className="ss-card-meta">
                    <span><Clock size={13} /> {subject.minutes} min</span>
                    <span><Eye size={13} /> {subject.views.toLocaleString()}</span>
                    <span><LayoutGrid size={13} /> {subject.topicsCount} topics</span>
                  </div>
                  {progress > 0 && (
                    <div className="ss-progress-wrap">
                      <div className="ss-progress-bar">
                        <div className="ss-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="ss-progress-label">{progress}% complete</span>
                    </div>
                  )}
                  <button className="ss-btn ss-btn-primary" onClick={(e) => { e.stopPropagation(); handleSubjectClick(subject); }}>
                    View Chapters <ChevronRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Chapters */}
        {currentLevel === 'chapters' && (
          <div className="ss-grid">
            {selectedSubject?.chapters.map(chapter => (
              <div key={chapter.id} className="ss-card chapter-card" onClick={() => handleChapterClick(chapter)}>
                <div className="ss-card-top">
                  <div className="ss-chapter-icon"><BookOpen size={20} /></div>
                  <div className="ss-card-badge">{chapter.topicsCount} topic</div>
                </div>
                <h3 className="ss-card-title">{chapter.title}</h3>
                <p className="ss-card-desc">
                  {chapter.desc.length > 80 ? chapter.desc.substring(0, 80) + '... ' : chapter.desc}
                  {chapter.desc.length > 80 && <span className="ss-show-more">Show more</span>}
                </p>
                <div className="ss-card-meta">
                  <span><Clock size={13} /> {chapter.minutes} min</span>
                  <span><Eye size={13} /> {chapter.views.toLocaleString()}</span>
                </div>
                <button className="ss-btn ss-btn-primary" onClick={(e) => { e.stopPropagation(); handleChapterClick(chapter); }}>
                  View Topics <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Topics */}
        {currentLevel === 'topics' && (
          <div className="ss-topics-grid">
            {selectedChapter?.topics.map(topic => {
              const isCompleted = !!completedTopics[topic.title];
              return (
                <div key={topic.id} className={`ss-topic-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="ss-topic-header">
                    <div className={`ss-topic-status-dot ${isCompleted ? 'done' : 'pending'}`} />
                    <span className={`ss-topic-badge ${isCompleted ? 'badge-done' : 'badge-pending'}`}>
                      {isCompleted ? '✓ Completed' : 'Not Started'}
                    </span>
                  </div>
                  <h3 className="ss-topic-title">{topic.title}</h3>
                  <p className="ss-topic-desc">
                    {topic.desc.length > 80 ? topic.desc.substring(0, 80) + '... ' : topic.desc}
                    {topic.desc.length > 80 && <span className="ss-show-more">Show more</span>}
                  </p>
                  <div className="ss-topic-meta">
                    <span><Clock size={13} /> {topic.minutes} minutes</span>
                  </div>
                  <div className="ss-topic-actions">
                    {!isCompleted ? (
                      <button
                        className="ss-btn ss-btn-start"
                        onClick={() => onSelectUnit(selectedSubject.title, topic.title)}
                      >
                        <Play size={15} /> Start Test
                      </button>
                    ) : (
                      <>
                        <button
                          className="ss-btn ss-btn-report"
                          onClick={() => onViewReport && onViewReport(selectedSubject.title, topic.title)}
                        >
                          <FileText size={15} /> View Report
                        </button>
                        <button
                          className="ss-btn ss-btn-retake"
                          onClick={() => onSelectUnit(selectedSubject.title, topic.title)}
                        >
                          <RotateCcw size={15} /> Retake Test
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelection;
