import React, { useState, useEffect, useRef } from 'react';
import Loading from '../ui/Loading';
import ConfirmModal from '../ui/ConfirmModal';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import '../Dashboard/Dashboard.css';

const TakeAssessment = ({ user, assessmentId, setActiveTab }) => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  // Anti-cheat & Timer state
  const [_vId, _setVId] = useState(0);
  const _vIdRef = useRef(0);
  const [_at, _setAt] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Pre-assessment check state
  const [step, setStep] = useState('network_check'); // 'network_check', 'assessment'
  const [internetStatus, setInternetStatus] = useState('checking'); // 'checking', 'poor', 'good'

  const checkInternet = async () => {
    setInternetStatus('checking');
    try {
      const startTime = performance.now();
      await fetch('https://picsum.photos/1000/1000?random=' + new Date().getTime(), { mode: 'no-cors' });
      const duration = (performance.now() - startTime) / 1000;
      if (duration < 3.5) {
        setInternetStatus('good');
      } else {
        setInternetStatus('poor');
      }
    } catch (err) {
      setInternetStatus('poor');
    }
  };

  useEffect(() => {
    if (step === 'network_check') {
      checkInternet();
    }
  }, [step]);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        _vIdRef.current += 1;
        const currentSwitches = _vIdRef.current;
        _setVId(currentSwitches);

        if (currentSwitches === 1) {
          setWarningMsg('WARNING: You have switched tabs. Switching tabs is not allowed during the assessment. If you switch tabs 3 times, your assessment will be automatically submitted.');
          toast.error('WARNING: You have switched tabs. Switching tabs is not allowed during the assessment.');
        } else if (currentSwitches === 2) {
          setWarningMsg('FINAL WARNING: You have switched tabs 2 times! One more time and your assessment will be auto-submitted!');
          toast.error('FINAL WARNING: You have switched tabs 2 times! One more time and your assessment will be auto-submitted!');
        } else if (currentSwitches >= 3) {
          toast.error('You have switched tabs 3 times. Your assessment is being automatically submitted.');
          submitAssessment(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [assessment, answers, submitted]);

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      if (data._at) {
        _setAt(data._at);
      }
      
      // Jumble questions and options
      if (data.questions) {
        const shuffledQuestions = data.questions.map((q, i) => {
          let shuffledOptions = [];
          if (q.options) {
            shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          }
          return { ...q, originalIndex: i, options: shuffledOptions };
        }).sort(() => Math.random() - 0.5);
        
        data.questions = shuffledQuestions;
        setAnswers(shuffledQuestions.map(q => ({ questionIndex: q.originalIndex, selectedOption: '' })));
      }
      
      setAssessment(data);
      if (data.timeLimit && data.timeLimit > 0) {
        setTimeLeft(data.timeLimit * 60); // Convert mins to seconds
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error('Time is up! Your assessment is being automatically submitted.');
      submitAssessment(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSelectOption = (qIndex, optionValue) => {
    const newAnswers = [...answers];
    newAnswers[qIndex].selectedOption = optionValue;
    setAnswers(newAnswers);
  };

  const submitAssessment = async (isAutoSubmit = false) => {
    if (submitted) return;
    
    if (!isAutoSubmit) {
      setConfirmModalOpen(true);
      return;
    }
    
    await executeSubmission(isAutoSubmit);
  };

  const executeSubmission = async (isAutoSubmit = false) => {
    setConfirmModalOpen(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: user._id,
          answers,
          _vId: _vIdRef.current,
          autoSubmitted: isAutoSubmit,
          _at
        })
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      setWarningMsg('');
      
      if (isAutoSubmit) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.log(err));
        }
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting assessment');
    }
  };

  if (loading) return <Loading message="Loading assessment details..." fullScreen={true} />;
  if (!assessment) return <div style={{ padding: '2rem' }}>Assessment not found.</div>;

  const handleStartAssessment = () => {
    setStep('assessment');
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  if (step === 'network_check') {
    return (
      <div className="dashboard-container" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>System Check</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Before starting the assessment, we need to verify your internet connection.
          </p>
          
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Internet Speed</span>
            {internetStatus === 'checking' && <span style={{ color: 'var(--accent-primary)' }}>Checking...</span>}
            {internetStatus === 'poor' && <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={18} /> Poor</span>}
            {internetStatus === 'good' && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Good</span>}
          </div>

          {internetStatus === 'poor' && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Your internet connection is unstable or too slow. Please check your connection and try again.
              </p>
              <button className="btn btn-secondary" onClick={checkInternet}>
                Retry Check
              </button>
            </div>
          )}

          {internetStatus === 'good' && (
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }} onClick={handleStartAssessment}>
              Next: Start Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Assessment Submitted!</h2>
          
          <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', margin: '2rem 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Score</p>
            <h1 style={{ color: 'var(--accent-primary)', fontSize: '3rem', margin: 0 }}>
              {result?.score} / {result?.totalQuestions}
            </h1>
          </div>

          {result?.autoSubmitted && (
            <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Note: This assessment was automatically submitted because you switched tabs 3 times.
            </p>
          )}

          <button className="btn btn-primary" onClick={() => setActiveTab('assessments')}>
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{assessment.title}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{assessment.description}</p>
        </div>
        
        {timeLeft !== null && (
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: `1px solid ${timeLeft < 60 ? 'var(--error)' : 'var(--accent-primary)'}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={24} color={timeLeft < 60 ? 'var(--error)' : 'var(--accent-primary)'} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--error)' : 'var(--text-primary)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {warningMsg && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid var(--error)', borderRadius: '0.5rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 'bold' }}>{warningMsg}</span>
          </div>
        )}


      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {assessment.questions.map((q, qIndex) => (
          <div key={qIndex} style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>Q{qIndex + 1}.</span> 
              {q.questionText}
            </h3>
            
            {assessment.type === 'mcq' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: answers[qIndex]?.selectedOption === opt ? 'rgba(77, 171, 247, 0.1)' : 'var(--bg-tertiary)', border: `1px solid ${answers[qIndex]?.selectedOption === opt ? 'var(--accent-primary)' : 'var(--border-color)'}`, borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input 
                      type="radio" 
                      name={`question-${qIndex}`} 
                      value={opt}
                      checked={answers[qIndex]?.selectedOption === opt}
                      onChange={() => handleSelectOption(qIndex, opt)}
                      style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }}
                    />
                    <span style={{ fontSize: '1.05rem' }}>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                value={answers[qIndex]?.selectedOption || ''}
                onChange={(e) => handleSelectOption(qIndex, e.target.value)}
                placeholder="Type your answer here..."
                style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => submitAssessment(false)}
          style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          Submit Assessment
        </button>
      </div>

      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Submit Assessment?"
        message="Are you sure you are ready to submit your assessment? You cannot undo this action."
        confirmText="Yes, Submit"
        cancelText="Cancel"
        onConfirm={() => executeSubmission(false)}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};

export default TakeAssessment;
