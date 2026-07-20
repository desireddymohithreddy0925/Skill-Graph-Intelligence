import React, { useState, useEffect } from 'react';
import SubjectSelection from './SubjectSelection';
import Instructions from './Instructions';
import SystemCheck from './SystemCheck';
import LiveInterview from './LiveInterview';
import AnalysisReport from './AnalysisReport';
import { VivaAPI } from '../../api/client';
import toast from 'react-hot-toast';

const VivaFlow = ({ onViewReport }) => {
  const [stage, setStage] = useState('subject-selection');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [stream, setStream] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stage === 'live-interview') {
        toast.error("Tab switching is not allowed during the interview. You are being redirected to the start.");
        handleReturnHome();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stage]);

  const handleSelectUnit = async (subject, unit) => {
    setSelectedSubject(subject);
    setSelectedUnit(unit);
    try {
      const response = await VivaAPI.startSession(subject, unit);
      setSessionId(response.sessionId);
      setInterviewQuestions(response.questions);
    } catch (err) {
      console.error('Failed to start session', err);
    }
    setStage('instructions');
  };

  const handleViewReport = (subject, unit) => {
    if (onViewReport) onViewReport(subject, unit);
  };

  const handleProceedToSystemCheck = () => setStage('system-check');

  const handleSystemCheckComplete = async (cameraStream) => {
    setStream(cameraStream);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error('Fullscreen request failed', e);
    }
    setStage('live-interview');
  };

  const handleInterviewComplete = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    try {
      if (selectedUnit) await VivaAPI.completeTopic(selectedUnit);
    } catch (err) {
      console.error('Failed to mark topic complete', err);
    }
    setStage('analysis');
  };

  const handleReturnHome = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStage('subject-selection');
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      {stage === 'subject-selection' && (
        <SubjectSelection onSelectUnit={handleSelectUnit} onViewReport={handleViewReport} />
      )}
      {stage === 'instructions' && (
        <Instructions onProceed={handleProceedToSystemCheck} />
      )}
      {stage === 'system-check' && (
        <SystemCheck onCheckComplete={handleSystemCheckComplete} onCancel={handleReturnHome} />
      )}
      {stage === 'live-interview' && (
        <LiveInterview
          stream={stream}
          sessionId={sessionId}
          questions={interviewQuestions}
          onComplete={handleInterviewComplete}
        />
      )}
      {stage === 'analysis' && (
        <AnalysisReport
          subject={selectedSubject}
          unit={selectedUnit}
          sessionId={sessionId || 'mock_session_1'}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

export default VivaFlow;
