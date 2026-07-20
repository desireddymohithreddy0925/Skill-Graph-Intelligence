import React, { useState, useEffect } from 'react';
import { Presentation, Plus, Play, ChevronRight, ChevronLeft, BarChart3, Cloud, MessageSquare, Trash2, Copy, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import './SkillTMeter.css';

const SkillTMeter = ({ user, onJoin }) => {
  const [presentations, setPresentations] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [activePresentation, setActivePresentation] = useState(null);
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState([
    { type: 'poll', question: 'New Poll Question', options: ['Option 1', 'Option 2'] }
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Live state
  const [socket, setSocket] = useState(null);
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    fetchPresentations();
  }, [user]);

  const fetchPresentations = async () => {
    if (!(user?._id || user?.id)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/user/${user._id || user.id}`);
      const data = await res.json();
      setPresentations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingId ? `${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${editingId}` : import.meta.env.VITE_BASE_URL + '/api/skilltmeter/presentations';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, createdBy: user._id || user.id, slides })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save presentation');
        return;
      }
      if (editingId) {
        setPresentations(presentations.map(p => p._id === editingId ? data : p));
      } else {
        setPresentations([data, ...presentations]);
      }
      setIsCreating(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Error saving presentation');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setTitle(p.title);
    setSlides(p.slides);
    setActiveSlideIndex(0);
    setIsCreating(true);
  };

  const handleDelete = async (pId) => {
    if (!window.confirm('Are you sure you want to delete this presentation?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${pId}`, { method: 'DELETE' });
      if (res.ok) {
        setPresentations(presentations.filter(p => p._id !== pId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting presentation');
    }
  };

  const fetchLeaderboard = async (presId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${presId}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) { console.error(err); }
  };

  const startPresentation = async (pres) => {
    // Fetch full presentation
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${pres._id}`);
    const data = await res.json();
    setActivePresentation(data);

    const newSocket = io(import.meta.env.VITE_BASE_URL + '');
    setSocket(newSocket);
    newSocket.emit('joinPresentation', data.joinCode);

    newSocket.on('newResponse', (responses) => {
      setActivePresentation(prev => ({ ...prev, responses }));
    });
    newSocket.on('newQa', (qa) => {
      setActivePresentation(prev => ({ ...prev, responses: { ...prev.responses, qa } }));
    });
    newSocket.on('qaUpdated', (qa) => {
      setActivePresentation(prev => ({ ...prev, responses: { ...prev.responses, qa } }));
    });
    newSocket.on('presentationEnded', () => {
      fetchLeaderboard(data._id);
    });
  };

  const stopPresentation = async () => {
    if (activePresentation) {
      try {
        await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${activePresentation._id}/end`, { method: 'POST' });
        fetchLeaderboard(activePresentation._id);
      } catch (err) { console.error(err); }
    }
    if (socket) socket.disconnect();
    setSocket(null);
  };

  const changeSlide = async (newIndex) => {
    if (newIndex < 0 || newIndex >= activePresentation.slides.length) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${activePresentation._id}/slide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideIndex: newIndex })
      });
      setActivePresentation(prev => ({ ...prev, currentSlideIndex: newIndex }));
    } catch (err) {
      console.error(err);
    }
  };

  const markQaAnswered = async (qaId) => {
    await fetch(`${import.meta.env.VITE_BASE_URL}/api/skilltmeter/presentations/${activePresentation.joinCode}/qa/${qaId}/answer`, { method: 'PUT' });
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Creation UI ---
  const addSlide = (type) => {
    const newSlide = { type, question: 'New Question' };
    if (type === 'poll') {
      newSlide.options = ['Option 1', 'Option 2'];
      newSlide.timeLimit = 30;
      newSlide.correctOptionIndex = -1;
    }
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const updateSlide = (field, value) => {
    const updated = [...slides];
    updated[activeSlideIndex][field] = value;
    setSlides(updated);
  };

  const updateOption = (optIndex, value) => {
    const updated = [...slides];
    updated[activeSlideIndex].options[optIndex] = value;
    setSlides(updated);
  };

  if (leaderboard) {
    return (
      <div className="skillt-container live-mode">
        <div className="live-header">
          <h2>Presentation Ended</h2>
          <button className="btn btn-primary" onClick={() => { setLeaderboard(null); setActivePresentation(null); }}>Back to Dashboard</button>
        </div>
        <div className="live-content" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ marginBottom: '2rem' }}>Final Leaderboard 🏆</h1>
          {leaderboard.length === 0 ? <p style={{ textAlign: 'center' }}>No participants scored points.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaderboard.map((lb, i) => (
                <div key={lb.userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: i === 0 ? 'rgba(0, 230, 118, 0.15)' : 'var(--bg-tertiary)', border: i === 0 ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: i === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>#{i + 1}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{lb.name}</span>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{lb.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activePresentation) {
    const currentSlide = activePresentation.slides[activePresentation.currentSlideIndex];
    const { polls, wordCloud, qa } = activePresentation.responses;
    const joinUrl = `${window.location.origin}?join=${activePresentation.joinCode}`;

    return (
      <div className="skillt-container live-mode">
        <div className="live-header">
          <div className="join-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <QRCodeSVG value={joinUrl} size={80} />
            </div>
            <div>
              <div style={{ marginBottom: '0.5rem' }}>Scan QR or enter code on Homepage:</div>
              <span className="join-code" onClick={() => handleCopy(activePresentation.joinCode)}>
                {activePresentation.joinCode} {copied ? <Check size={16}/> : <Copy size={16}/>}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={stopPresentation}>End Session</button>
        </div>

        <div className="live-content">
          <h1>{currentSlide.question}</h1>
          
          {currentSlide.type === 'poll' && (
            <div className="live-results poll-results">
              {currentSlide.options.map((opt, i) => {
                const count = polls.find(p => p.slideIndex === activePresentation.currentSlideIndex && p.optionIndex === i)?.count || 0;
                const total = polls.filter(p => p.slideIndex === activePresentation.currentSlideIndex).reduce((sum, p) => sum + p.count, 0) || 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={i} className="bar-container">
                    <div className="bar-label">{opt} <span className="bar-count">({count})</span></div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentSlide.type === 'wordcloud' && (
            <div className="live-results wordcloud-results">
              {wordCloud.filter(w => w.slideIndex === activePresentation.currentSlideIndex).map((w, i) => {
                const maxVal = Math.max(...wordCloud.map(x => x.count), 1);
                const ratio = w.count / maxVal;
                let size = '1rem';
                if (ratio > 0.8) size = '3rem';
                else if (ratio > 0.5) size = '2rem';
                else if (ratio > 0.2) size = '1.5rem';
                return <span key={i} style={{ fontSize: size, margin: '0.5rem', color: `hsl(${Math.random() * 360}, 70%, 60%)` }}>{w.word}</span>;
              })}
            </div>
          )}

          {currentSlide.type === 'qa' && (
            <div className="live-results qa-results">
              {qa.filter(q => q.slideIndex === activePresentation.currentSlideIndex).sort((a,b) => b.upvotes - a.upvotes).map(q => (
                <div key={q._id} className={`qa-card ${q.isAnswered ? 'answered' : ''}`}>
                  <div className="qa-card-top">
                    <strong>{q.author}</strong>
                    <span>{q.upvotes} 👍</span>
                  </div>
                  <p>{q.questionText}</p>
                  {!q.isAnswered && (
                    <button className="btn btn-primary" onClick={() => markQaAnswered(q._id)}>Mark Answered</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="live-footer">
          <button 
            className="btn btn-secondary" 
            onClick={() => changeSlide(activePresentation.currentSlideIndex - 1)}
            disabled={activePresentation.currentSlideIndex === 0}
          ><ChevronLeft/> Prev</button>
          <span>Slide {activePresentation.currentSlideIndex + 1} of {activePresentation.slides.length}</span>
          <button 
            className="btn btn-primary" 
            onClick={() => changeSlide(activePresentation.currentSlideIndex + 1)}
            disabled={activePresentation.currentSlideIndex === activePresentation.slides.length - 1}
          >Next <ChevronRight/></button>
        </div>
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className="skillt-container">
        <div className="skillt-header">
          <div>
            <h2 className="skillt-title"><Presentation size={24} /> Skill T Meter</h2>
            <p className="skillt-subtitle">Join a live presentation.</p>
          </div>
        </div>
        <div className="skillt-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Enter 6-digit code</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <input 
                type="text" 
                placeholder="000000" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                maxLength={6}
              />
              <button 
                onClick={() => joinCode.length === 6 && onJoin(joinCode)}
                style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'var(--accent-primary)', color: 'var(--bg-primary)', border: 'none', cursor: joinCode.length === 6 ? 'pointer' : 'not-allowed', opacity: joinCode.length === 6 ? 1 : 0.7, fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                Join Presentation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="skillt-container">
      <div className="skillt-header">
        <div>
          <h2 className="skillt-title"><Presentation size={24} /> Skill T Meter</h2>
          <p className="skillt-subtitle">Interactive polling and Q&A.</p>
        </div>
        {!isCreating && <button className="btn btn-primary" onClick={() => { setEditingId(null); setTitle(''); setSlides([{ type: 'poll', question: 'New Poll Question', options: ['Option 1', 'Option 2'] }]); setIsCreating(true); }}><Plus/> New Presentation</button>}
      </div>

      <div className="skillt-body">
        {isCreating ? (
          <div className="create-view">
            <input 
              type="text" 
              className="pres-title-input" 
              placeholder="Presentation Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
            />
            
            <div className="editor-layout">
              <div className="slide-list">
                {slides.map((s, i) => (
                  <div key={i} className={`slide-item ${i === activeSlideIndex ? 'active' : ''}`} onClick={() => setActiveSlideIndex(i)}>
                    <div className="slide-item-type">
                      {s.type === 'poll' && <BarChart3 size={16}/>}
                      {s.type === 'wordcloud' && <Cloud size={16}/>}
                      {s.type === 'qa' && <MessageSquare size={16}/>}
                      {i + 1}
                    </div>
                  </div>
                ))}
                <div className="add-slide-buttons">
                  <button onClick={() => addSlide('poll')}><BarChart3 size={16}/> Poll</button>
                  <button onClick={() => addSlide('wordcloud')}><Cloud size={16}/> Word Cloud</button>
                  <button onClick={() => addSlide('qa')}><MessageSquare size={16}/> Q&A</button>
                </div>
              </div>

              <div className="slide-details">
                <label>Question</label>
                <input 
                  type="text" 
                  value={slides[activeSlideIndex].question} 
                  onChange={e => updateSlide('question', e.target.value)}
                />

                {slides[activeSlideIndex].type === 'poll' && (
                  <div className="options-list">
                    <label>Options</label>
                    {slides[activeSlideIndex].options.map((opt, optIdx) => (
                      <input 
                        key={optIdx} 
                        type="text" 
                        value={opt} 
                        onChange={e => updateOption(optIdx, e.target.value)}
                      />
                    ))}
                    <button className="btn btn-secondary" onClick={() => updateSlide('options', [...slides[activeSlideIndex].options, `Option ${slides[activeSlideIndex].options.length + 1}`])}>+ Add Option</button>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label>Time Limit (Seconds)</label>
                        <input type="number" value={slides[activeSlideIndex].timeLimit ?? 30} onChange={e => updateSlide('timeLimit', e.target.value === '' ? '' : parseInt(e.target.value))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Correct Answer</label>
                        <select 
                          value={slides[activeSlideIndex].correctOptionIndex ?? -1} 
                          onChange={e => updateSlide('correctOptionIndex', parseInt(e.target.value))}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
                        >
                          <option value="-1">No Correct Answer</option>
                          {slides[activeSlideIndex].options.map((opt, i) => (
                            <option key={i} value={i}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="create-actions">
              <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>Save Presentation</button>
            </div>
          </div>
        ) : (
          <div className="presentations-list">
            {presentations.length === 0 ? <p>No presentations yet. Create one!</p> : (
              presentations.map(p => (
                <div key={p._id} className="presentation-card">
                  <div className="pres-info">
                    <h3>{p.title}</h3>
                    <p>{p.slides.length} slides</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => startPresentation(p)} style={{ width: '100%' }}><Play size={16}/> Present</button>
                    {(user.role === 'mentor' || user.role === 'skill t team' || user.role === 'admin' || user.role === 'subadmin') && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" onClick={() => handleEdit(p)} style={{ flex: 1 }}>Edit</button>
                        <button className="btn btn-secondary" onClick={() => handleDelete(p._id)} style={{ flex: 1, color: 'var(--error)' }}><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTMeter;
