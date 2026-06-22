import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './AudienceView.css';

const AudienceView = ({ joinCode, onLeave, user }) => {
  const [socket, setSocket] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [qaList, setQaList] = useState([]);
  const [error, setError] = useState(null);

  // Poll state
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // WordCloud state
  const [word, setWord] = useState('');

  // QA state
  const [qaText, setQaText] = useState('');

  useEffect(() => {
    // Request fullscreen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    return () => {
      // Exit fullscreen on unmount
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  useEffect(() => {
    // Fetch initial data
    fetch(`http://localhost:5001/api/skilltmeter/join/${joinCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPresentation(data);
          setCurrentSlide(data.currentSlide);
          setQaList(data.qa || []);
          
          // Connect socket
          const newSocket = io('http://localhost:5001');
          setSocket(newSocket);
          newSocket.emit('joinPresentation', joinCode);

          newSocket.on('slideChanged', (data) => {
            setCurrentSlide(data.currentSlide);
            setHasVoted(false);
            setSelectedOption(null);
            setWord('');
            
            if (data.currentSlide?.type === 'poll' && data.currentSlide?.timeLimit) {
               // Calculate time left
               const elapsed = (new Date() - new Date(data.slideStartTime)) / 1000;
               setTimeLeft(Math.max(0, Math.floor(data.currentSlide.timeLimit - elapsed)));
            } else {
               setTimeLeft(null);
            }
          });

          newSocket.on('newQa', (newQaList) => setQaList(newQaList));
          newSocket.on('qaUpdated', (newQaList) => setQaList(newQaList));
        }
      })
      .catch(err => setError('Failed to connect to presentation'));

    return () => {
      if (socket) socket.disconnect();
    };
  }, [joinCode]);

  useEffect(() => {
    let timer;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const submitResponse = async (type, payload) => {
    try {
      const body = { type, slideIndex: presentation.currentSlideIndex, payload, userId: user?._id };
      await fetch(`http://localhost:5001/api/skilltmeter/presentations/${joinCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      setHasVoted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const submitWord = async () => {
    if (!word.trim()) return;
    await submitResponse('wordcloud', { word });
    setWord('');
  };

  const submitQa = async () => {
    if (!qaText.trim()) return;
    await fetch(`http://localhost:5001/api/skilltmeter/presentations/${joinCode}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionText: qaText, slideIndex: presentation.currentSlideIndex, userId: user?._id })
    });
    setQaText('');
  };

  const upvoteQa = async (qaId) => {
    await fetch(`http://localhost:5001/api/skilltmeter/presentations/${joinCode}/qa/${qaId}/upvote`, {
      method: 'PUT'
    });
  };

  if (error) {
    return (
      <div className="audience-container">
        <h2>{error}</h2>
        <button onClick={onLeave} className="btn-primary">Go Back</button>
      </div>
    );
  }

  if (!currentSlide) return <div className="audience-container">Loading...</div>;

  return (
    <div className="audience-container">
      <div className="audience-header">
        <h2>{presentation.title}</h2>
        <button onClick={onLeave} className="btn-leave">Leave</button>
      </div>

      <div className="audience-content">
        <h1 className="slide-question">{currentSlide.question}</h1>

        {currentSlide.type === 'poll' && (
          <div className="audience-poll">
            {timeLeft !== null && (
              <div style={{ textAlign: 'center', marginBottom: '1rem', color: timeLeft <= 5 ? 'var(--error)' : 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                ⏱ {timeLeft}s remaining
              </div>
            )}
            {hasVoted ? (
              <div className="vote-success">
                <h3>Vote Recorded!</h3>
                <p>Wait for the presenter to show the results.</p>
              </div>
            ) : (
              <div className="poll-options">
                {currentSlide.options.map((opt, i) => (
                  <button 
                    key={i} 
                    className={`poll-option ${selectedOption === i ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(i)}
                    disabled={timeLeft === 0}
                  >
                    {opt}
                  </button>
                ))}
                <button 
                  className="btn btn-primary btn-submit" 
                  onClick={() => submitResponse('poll', { optionIndex: selectedOption })}
                  disabled={selectedOption === null || timeLeft === 0}
                >
                  Submit Vote
                </button>
                {timeLeft === 0 && <p style={{ textAlign: 'center', color: 'var(--error)', marginTop: '1rem' }}>Time's up!</p>}
              </div>
            )}
          </div>
        )}

        {currentSlide.type === 'wordcloud' && (
          <div className="wordcloud-input">
            <input 
              type="text" 
              placeholder="Enter a word (max 25 chars)" 
              maxLength={25}
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            <button className="btn-submit" onClick={submitWord} disabled={!word.trim()}>
              Submit Word
            </button>
          </div>
        )}

        {currentSlide.type === 'qa' && (
          <div className="qa-section">
            <div className="qa-input">
              <textarea 
                placeholder="Ask a question..." 
                value={qaText}
                onChange={(e) => setQaText(e.target.value)}
              />
              <button className="btn-submit" onClick={submitQa} disabled={!qaText.trim()}>Ask</button>
            </div>
            
            <div className="qa-list">
              {qaList.sort((a,b) => b.upvotes - a.upvotes).map(qa => (
                <div key={qa._id} className={`qa-item ${qa.isAnswered ? 'answered' : ''}`}>
                  <div className="qa-text">{qa.questionText}</div>
                  <div className="qa-actions">
                    <button onClick={() => upvoteQa(qa._id)}>👍 {qa.upvotes}</button>
                    {qa.isAnswered && <span className="badge-answered">Answered</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceView;
