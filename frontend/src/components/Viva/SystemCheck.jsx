import React, { useState, useEffect } from 'react';
import { StepperHeader } from './Instructions';
import { Camera, Mic, Wifi, X, Check, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import './SystemCheck.css';

const SystemCheck = ({ onCheckComplete, onCancel }) => {
  const [internetStatus, setInternetStatus] = useState('idle'); // idle, checking, poor, good
  const [audioStatus, setAudioStatus] = useState('idle'); // idle, checking, passed
  const [videoStatus, setVideoStatus] = useState('idle'); // idle, checking, passed
  
  const [showMicModal, setShowMicModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [mics, setMics] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [stream, setStream] = useState(null);
  
  const [isListening, setIsListening] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const handleRecheckInternet = async () => {
    setInternetStatus('checking');
    try {
      const startTime = performance.now();
      // Use a timestamp to prevent caching
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
    handleRecheckInternet();
  }, []);

  const handleAudioCheck = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      setMics(audioDevices);
      if (audioDevices.length > 0) {
        setSelectedMic(audioDevices[0].deviceId);
      }
      setShowMicModal(true);
      // clean up stream for now, we just wanted permission to list them
      audioStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      toast.error('Microphone access denied or error occurred.');
    }
  };

  const handleStartMicCheck = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setShowMicModal(false);
      setAudioStatus('passed');
    }, 3000);
  };

  const handleVideoCheck = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(videoStream);
      setShowCameraModal(true);
      setCapturedImage(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      }, 100);
    } catch (err) {
      toast.error('Camera access denied or error occurred.');
    }
  };

  const handleCapturePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 300, 225);
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
      setIsVerifyingFace(true);
      
      setTimeout(() => {
        setIsVerifyingFace(false);
        setShowCameraModal(false);
        setVideoStatus('passed');
      }, 2500);
    }
  };

  const allPassed = internetStatus === 'good' && audioStatus === 'passed' && videoStatus === 'passed';

  return (
    <div className="animate-fade-in" style={{background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '4rem'}}>
      <StepperHeader step={2} />
      
      <div className="checklist-container">
        <h2 className="checklist-main-title">Assessment Checklist</h2>
        <p className="checklist-subtitle">
          Obtain the necessary permissions for the interview in advance to ensure<br/>a smooth process
        </p>

        <div className="checklist-items">
          {/* Internet Speed Item */}
          <div className={`checklist-item ${internetStatus === 'poor' ? 'expanded' : ''}`}>
            <div className="checklist-item-header">
              <div className="checklist-item-label">
                <div className="icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20v-6M6 20V10M18 20V4" />
                  </svg>
                </div>
                <span>Internet Speed</span>
              </div>
              <div className="checklist-item-action">
                {internetStatus === 'idle' && <MoreHorizontal size={20} color="#111827" />}
                {internetStatus === 'checking' && <span className="status-text checking">Checking...</span>}
                {internetStatus === 'poor' && (
                  <span className="status-text error">Poor Internet Connection <X size={16} /></span>
                )}
                {internetStatus === 'good' && (
                  <span className="status-text success">Good Connection <Check size={16} /></span>
                )}
              </div>
            </div>
            {internetStatus === 'poor' && (
              <div className="checklist-item-body">
                <p>Make sure you start the assessment with good internet connection.</p>
                <button className="btn-recheck" onClick={handleRecheckInternet}>Recheck Internet Speed</button>
              </div>
            )}
          </div>

          {/* Audio Permission Item */}
          <div className="checklist-item">
            <div className="checklist-item-header">
              <div className="checklist-item-label">
                <div className="icon-wrapper"><Mic size={18} /></div>
                <span>Voice Match</span>
              </div>
              <div className="checklist-item-action">
                {audioStatus === 'idle' && (
                  <button className="btn-proceed-check" onClick={handleAudioCheck}>Proceed to check</button>
                )}
                {audioStatus === 'passed' && (
                  <span className="status-text success">Passed <Check size={16} /></span>
                )}
              </div>
            </div>
          </div>

          {/* Video Permission Item */}
          <div className="checklist-item">
            <div className="checklist-item-header">
              <div className="checklist-item-label">
                <div className="icon-wrapper"><Camera size={18} /></div>
                <span>Facial Match</span>
              </div>
              <div className="checklist-item-action">
                {videoStatus === 'idle' && (
                  <button className="btn-proceed-check" onClick={handleVideoCheck}>Proceed to check</button>
                )}
                {videoStatus === 'passed' && (
                  <span className="status-text success">Passed <Check size={16} /></span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="start-assessment-action">
          <button 
            className="btn-start-assessment" 
            disabled={!allPassed}
            onClick={() => onCheckComplete(stream)}
          >
            Start Assessment →
          </button>
        </div>
      </div>

      {showMicModal && (
        <div className="modal-overlay">
          <div className="mic-modal">
            <div className="mic-modal-header">
              <h3>Voice Match</h3>
              <button className="close-btn" onClick={() => setShowMicModal(false)}><X size={20} /></button>
            </div>
            <div className="mic-modal-body">
              <div className="mic-select-row" style={{marginBottom: '1.5rem'}}>
                <div className="mic-select-wrapper" style={{flex: 1}}>
                  <Mic size={18} className="mic-icon" />
                  <select 
                    value={selectedMic} 
                    onChange={e => setSelectedMic(e.target.value)}
                    className="mic-select"
                  >
                    {mics.length > 0 ? mics.map(m => (
                      <option key={m.deviceId} value={m.deviceId}>{m.label || 'Default Microphone'}</option>
                    )) : (
                      <option value="">Default Microphone</option>
                    )}
                  </select>
                </div>
              </div>
              <p>Please read the following text aloud to verify your voice:</p>
              <div className="voice-text-box" style={{padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '4px solid var(--accent-primary)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)'}}>
                "I'm ensuring that my microphone is working properly and accurately"
              </div>
              <button 
                className="btn-start-mic" 
                onClick={handleStartMicCheck}
                disabled={isListening}
                style={{ opacity: isListening ? 0.7 : 1, width: '100%', padding: '0.8rem' }}
              >
                {isListening ? 'Listening...' : 'Verify Voice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCameraModal && (
        <div className="modal-overlay">
          <div className="mic-modal camera-modal">
            <div className="mic-modal-header">
              <h3>Facial Match</h3>
              <button className="close-btn" onClick={() => {
                setShowCameraModal(false);
                if (stream && videoStatus !== 'passed') {
                  stream.getTracks().forEach(t => t.stop());
                  setStream(null);
                }
              }}><X size={20} /></button>
            </div>
            <div className="mic-modal-body">
              <p>Please click a picture to verify it matches your profile picture.</p>
              
              <div className="video-container" style={{position: 'relative', width: '300px', height: '225px', background: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1.5rem'}}>
                {!capturedImage ? (
                  <video ref={videoRef} autoPlay playsInline muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <img src={capturedImage} alt="Captured" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                )}
                
                {isVerifyingFace && (
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
                    <div className="spinner" style={{width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem'}}></div>
                    Verifying Match...
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} width="300" height="225" style={{display: 'none'}} />

              {!capturedImage && (
                <button 
                  className="btn-start-mic" 
                  onClick={handleCapturePicture}
                  style={{width: '100%', padding: '0.8rem'}}
                >
                  <Camera size={20} style={{marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle'}}/>
                  Click Picture
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemCheck;
