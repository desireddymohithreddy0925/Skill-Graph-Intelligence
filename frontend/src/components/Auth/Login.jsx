import React, { useState, useEffect } from 'react';
import { Network, BrainCircuit, TrendingUp, Award, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
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

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ email: userEmail })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          onLogin(data.user);
          // Also store the standard token if the backend returns one, or just rely on Firebase
          if (data.token) localStorage.setItem('token', data.token);
        } else {
          toast.error(data.error || 'Authentication failed');
          if (!isRegistering && data.error && data.error.includes('create an account')) {
            setIsRegistering(true);
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        // Firebase specific error messages
        if (err.code === 'auth/email-already-in-use') {
          toast.error('This email is already registered. Please sign in instead.');
          setIsRegistering(false);
        } else {
          toast.error('Authentication Error: ' + err.message);
        }
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
              <h2 className="login-card-title">{isRegistering ? 'Create Account' : 'Welcome back'}</h2>
              <p className="login-card-subtitle">
                {isRegistering ? 'Join the platform to map your career' : 'Sign in to continue your learning journey'}
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
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
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password">Password</label>
                  {!isRegistering && <a href="#" onClick={(e) => { e.preventDefault(); toast("Please contact support to reset your password.", { icon: 'ℹ️' }); }} className="login-forgot">Forgot password?</a>}
                </div>
                <div className="login-input-wrapper">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <>
                  <div className="login-input-group">
                    <label htmlFor="confirmPassword">Re-enter Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={16} className="login-input-icon" />
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
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
                        required
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
                    {isRegistering ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    {isRegistering ? 'Create Account' : 'Sign In'} 
                    {isRegistering ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                  </span>
                )}
              </button>
            </form>

            <div className="login-toggle">
              {isRegistering ? (
                <p>Already have an account? <span className="login-toggle-link" onClick={() => setIsRegistering(false)}>Sign in</span></p>
              ) : (
                <p>Don't have an account? <span className="login-toggle-link" onClick={() => setIsRegistering(true)}>Create one</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
