import React, { useState, useEffect } from 'react';
import { Network, BrainCircuit, TrendingUp, Award, Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

const Login = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const isRegistering = authMode === 'register';
  const isForgot = authMode === 'forgot';
  const isReset = authMode === 'reset';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Captcha State
  const [captchaMath, setCaptchaMath] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, [isRegistering]);

  const generateCaptcha = () => {
    setCaptchaMath({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaAnswer('');
  };

  const validateEmail = (email) => {
    // Strict email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(`[FORM SUBMIT] authMode: ${authMode}`);
    if (authMode === 'forgot') return handleForgotPassword(e);
    if (authMode === 'reset') return handleResetPassword(e);
    return handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log('[handleSubmit] Started login/register flow');
    console.log(`[handleSubmit] Email: ${email}, isRegistering: ${isRegistering}`);
    
    if (!email || !password) {
      console.log('[handleSubmit] Missing credentials (possible Safari autofill issue)');
      toast.error("Please ensure your email and password are filled out.");
      return;
    }

    if (!validateEmail(email)) {
      console.log('[handleSubmit] Email validation failed');
      toast.error("Please enter a valid email address.");
      return;
    }
    
    if (isRegistering) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      const expectedAnswer = captchaMath.num1 + captchaMath.num2;
      if (parseInt(captchaAnswer) !== expectedAnswer) {
        generateCaptcha();
        toast.error("Incorrect math captcha answer. Please try again.");
        return;
      }
    }

    console.log('[handleSubmit] Setting isLoading to true');
    setIsLoading(true);
    
      try {
        let firebaseToken = null;
        let userEmail = email;

        try {
          const { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
          const { auth } = await import("../../firebase");

          if (isRegistering) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            firebaseToken = await userCredential.user.getIdToken();
            toast.success("Verification email sent! Please check your inbox (and spam folder).", { duration: 5000 });
          } else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseToken = await userCredential.user.getIdToken();
          }
        } catch (firebaseErr) {
          console.log("Firebase logic failed, falling back to local database authentication.", firebaseErr);
        }

        // Now send the token to our backend to sync with MongoDB
        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const headers = { 'Content-Type': 'application/json' };
        if (firebaseToken) {
          headers['Authorization'] = `Bearer ${firebaseToken}`;
        }

        console.log(`[handleSubmit] Sending request to backend: ${endpoint}`);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL || ''}${endpoint}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ email: userEmail, password: password }),
          credentials: 'include'
        });
        
        console.log(`[handleSubmit] Backend responded with status: ${response.status}`);
        const data = await response.json();
        console.log(`[handleSubmit] Backend data:`, data);
        
        if (response.ok) {
          console.log('[handleSubmit] Authentication successful! Calling onLogin...');
          onLogin(data.user);
          // Also store the standard token if the backend returns one, or just rely on Firebase
          if (data.token) {
            // Token is now set securely via HttpOnly cookie by the backend
          }
        } else {
          console.log(`[handleSubmit] Authentication failed: ${data.error}`);
          toast.error(data.error || 'Authentication failed');
          if (!isRegistering && data.error && data.error.includes('create an account')) {
            setAuthMode('register');
          }
        }
      } catch (err) {
        console.error('[handleSubmit] Fatal error during auth:', err);
        // Firebase specific error messages
        if (err.code === 'auth/email-already-in-use') {
          toast.error('This email is already registered. Please sign in instead.');
          setAuthMode('login');
        } else {
          toast.error('Authentication Error: ' + err.message);
        }
      } finally {
      console.log('[handleSubmit] Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log(`[handleForgotPassword] called with email: ${email}`);
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'OTP sent to your email!');
        setAuthMode('reset');
      } else {
        toast.error(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log(`[handleResetPassword] called with email: ${email}, otp: ${otp}`);
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password has been reset successfully! Please sign in.');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      } else {
        toast.error(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-blob login-bg-blob--1"></div>
      <div className="login-bg-blob login-bg-blob--2"></div>
      <div className="login-bg-blob login-bg-blob--3"></div>

      <div className="login-wrapper">
        <div className="login-left-panel">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Network size={28} color="var(--accent-primary)" />
            </div>
            <span className="login-brand-name">Skill Graph</span>
          </div>

          <h1 className="login-hero-title">
            Map your skills.<br />
            <span className="login-hero-accent">Master your future.</span>
          </h1>
          <p className="login-hero-subtitle">
            The AI-powered intelligence layer that connects your skills to the jobs you want.
          </p>

          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <BrainCircuit size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div className="login-feature-title">AI Skill Gap Analyzer</div>
                <div className="login-feature-desc">Pinpoint exactly what to learn next</div>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <TrendingUp size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div className="login-feature-title">Placement Readiness Score</div>
                <div className="login-feature-desc">Know your interview readiness in real-time</div>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                <Award size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div className="login-feature-title">Gamified Learning</div>
                <div className="login-feature-desc">Earn XP and climb the leaderboard</div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-card-brand">
                <Network size={20} color="var(--accent-primary)" />
                <span>Skill Graph</span>
              </div>
              <h2 className="login-card-title">
                {isRegistering ? 'Create Account' : isForgot ? 'Reset Password' : isReset ? 'Enter OTP' : 'Welcome back'}
              </h2>
              <p className="login-card-subtitle">
                {isRegistering ? 'Join the platform to map your career' : isForgot ? 'Enter your email to receive an OTP' : isReset ? 'Create your new password' : 'Sign in to continue your learning journey'}
              </p>
            </div>

            <form className="login-form" onSubmit={handleFormSubmit}>
              
              {!isReset && (
                <div className="login-input-group">
                  <label htmlFor="email">Email address</label>
                  <div className="login-input-wrapper">
                    <Mail size={16} className="login-input-icon" />
                    <input
                      type="email"
                      id="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {isReset && (
                <>
                  <div className="login-input-group">
                    <label htmlFor="otp">6-Digit OTP</label>
                    <div className="login-input-wrapper">
                      <Lock size={16} className="login-input-icon" />
                      <input type="text" id="otp" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ paddingLeft: '3rem' }} />
                    </div>
                  </div>
                  <div className="login-input-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={16} className="login-input-icon" />
                      <input type={showPassword ? "text" : "password"} id="newPassword" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ paddingLeft: '3rem' }} />
                      <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="login-input-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={16} className="login-input-icon" />
                      <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ paddingLeft: '3rem' }} />
                      <button type="button" className="login-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {(!isForgot && !isReset) && (
                <div className="login-input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="password">Password</label>
                    {!isRegistering && <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); }} className="login-forgot">Forgot password?</a>}
                  </div>
                  <div className="login-input-wrapper">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {isRegistering && (
                <>
                  <div className="login-input-group">
                    <label htmlFor="confirmPassword">Re-enter Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={16} className="login-input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button type="button" className="login-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="login-input-group">
                    <label htmlFor="captcha">Security Verification: What is {captchaMath.num1} + {captchaMath.num2}?</label>
                    <div className="login-input-wrapper">
                      <input
                        type="number"
                        id="captcha"
                        placeholder="Enter sum"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="login-loading">
                    <span className="login-spinner"></span>
                    {isRegistering ? 'Creating Account...' : isForgot ? 'Sending OTP...' : isReset ? 'Resetting...' : 'Signing In...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    {isRegistering ? 'Create Account' : isForgot ? 'Send OTP' : isReset ? 'Reset Password' : 'Sign In'} 
                    {isRegistering ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                  </span>
                )}
              </button>
            </form>

            <div className="login-toggle">
              {isRegistering ? (
                <p>Already have an account? <span className="login-toggle-link" onClick={() => setAuthMode('login')}>Sign in</span></p>
              ) : isForgot || isReset ? (
                <p>Remembered your password? <span className="login-toggle-link" onClick={() => setAuthMode('login')}>Sign in</span></p>
              ) : (
                <p>Don't have an account? <span className="login-toggle-link" onClick={() => setAuthMode('register')}>Create one</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
