import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClan } from '../context/ClanContext';
import { KeyRound, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Landing = () => {
  const [view, setView] = useState('welcome'); // welcome, login, signup
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup specific
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [step, setStep] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);

  const { login, error } = useClan();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim()) return;

    const success = await login(nickname, password, null, true); // true = isLogin attempt
    if (success) {
      navigate('/home');
    }
  };

  const handleSignupNext = () => {
    if (step === 0 && nickname.trim().length > 2) setStep(1);
    else if (step === 1 && password.trim().length >= 6) setStep(2);
    else if (step === 2 && answers.q1.trim().length > 5) setStep(3);
    else if (step === 3 && answers.q2.trim().length > 5) setStep(4);
    else if (step === 4 && answers.q3.trim().length > 5) handleSignupSubmit();
  };

  const handleSignupSubmit = async () => {
    setSubmitting(true);
    setTimeout(async () => {
      const success = await login(nickname, password, answers, false);
      if (success) {
        setSubmitting(false);
        setApproved(true);
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      } else {
        setSubmitting(false);
        setStep(0); // Back to start if fail
      }
    }, 3000);
  };

  if (approved) {
    return (
      <div className="landing-container centered fade-in">
        <h1 className="success-message">Kapı aralandı.</h1>
        <p className="muted-text mt-4">Hemsaye'ye hoş geldin, Aday.</p>
        <div className="door-glow mt-8">
          <KeyRound size={48} className="gold-text animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="candle-glow"></div>

      <div className="form-panel glass-panel fade-in">
        {view === 'welcome' && (
          <div className="welcome-view text-center">
            <h1 className="title gold-text" style={{ fontSize: '3rem', border: 'none', padding: 0 }}>Hemsaye</h1>
            <p className="muted-text mb-12">Karanlıkta fısıldayanların sığınağı.</p>

            <div className="action-buttons">
              <button className="auth-btn btn-primary" onClick={() => setView('login')}>
                <LogIn size={18} /> Giriş Yap
              </button>
              <button className="btn-secondary auth-btn" onClick={() => setView('signup')}>
                <UserPlus size={18} /> Kayıt Ol
              </button>
            </div>
          </div>
        )}

        {view === 'login' && (
          <form className="login-view fade-in" onSubmit={handleLogin}>
            <h2 className="title mb-6 text-center">Ruhunu Doğrula</h2>
            {error && <p className="error-text mb-4 text-center">{error}</p>}

            <div className="step mb-4">
              <label className="text-sm muted-text mb-2 block">Takma Adın</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ruhun adı..."
                autoFocus
                className="styled-input-v2"
              />
            </div>

            <div className="step mb-6">
              <label className="text-sm muted-text mb-2 block">Mührün (Şifre)</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Gizli parolan..."
                  className="styled-input-v2"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="actions mt-6 flex-between">
              <button type="button" className="text-btn muted-text" onClick={() => setView('welcome')}>Geri Dön</button>
              <button type="submit" className="submit-btn gold-glow">İçeri Gir</button>
            </div>
          </form>
        )}

        {view === 'signup' && (
          <div className="signup-view fade-in">
            <h2 className="title text-center">Cemiyete Kabul Talebi</h2>
            {submitting ? (
              <div className="submitting-state">
                <div className="spinner"></div>
                <p className="mt-4 muted-text">Konsey yanıtını değerlendiriyor...</p>
                <p className="mt-2" style={{ fontStyle: 'italic', fontSize: '0.9em' }}>Karanlıkta beklemek sabır işidir.</p>
              </div>
            ) : (
              <div className="form-content">
                {step === 0 && (
                  <div className="step fade-in">
                    <label>Kendini nasıl çağırırsın?</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Görünmez adın..."
                      autoFocus
                    />
                    <p className="text-xs muted-text mt-2">En az 3 karakter.</p>
                  </div>
                )}
                {step === 1 && (
                  <div className="step fade-in">
                    <label>Gizli mührünü (şifreni) belirle</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Güçlü bir mühür seç..."
                        autoFocus
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs muted-text mt-2">En az 6 karakter.</p>
                  </div>
                )}
                {step === 2 && (
                  <div className="step fade-in">
                    <label>Sessizlik mi güçtür, yoksa bilgi mi?</label>
                    <textarea value={answers.q1} onChange={(e) => setAnswers({ ...answers, q1: e.target.value })} rows="3" autoFocus />
                  </div>
                )}
                {step === 3 && (
                  <div className="step fade-in">
                    <label>En son hangi gerçeği sorguladın?</label>
                    <textarea value={answers.q2} onChange={(e) => setAnswers({ ...answers, q2: e.target.value })} rows="3" autoFocus />
                  </div>
                )}
                {step === 4 && (
                  <div className="step fade-in">
                    <label>Eğer bir sembol olsaydın hangisi olurdun?</label>
                    <textarea value={answers.q3} onChange={(e) => setAnswers({ ...answers, q3: e.target.value })} rows="3" autoFocus />
                  </div>
                )}
                <div className="actions mt-6 flex-between">
                  <button type="button" className="text-btn muted-text" onClick={() => {
                    if (step === 0) setView('welcome');
                    else setStep(step - 1);
                  }}>Geri</button>
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSignupNext}
                    disabled={
                      (step === 0 && nickname.length < 3) ||
                      (step === 1 && password.length < 6) ||
                      (step === 2 && answers.q1.length < 6) ||
                      (step === 3 && answers.q2.length < 6) ||
                      (step === 4 && answers.q3.length < 6)
                    }
                  >
                    {step < 4 ? 'İleri' : 'Talebi İlet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(5, 5, 5, 0.9) 100%);
          position: relative;
          z-index: 1;
        }

        .landing-container.centered {
          flex-direction: column;
        }

        .form-panel {
          width: 100%;
          max-width: 500px;
          padding: 3rem;
          margin: 1rem;
          box-shadow: 0 0 40px rgba(197, 160, 89, 0.05);
        }

        .title {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(197, 160, 89, 0.2);
          padding-bottom: 1rem;
        }

        .error-text {
          color: #ff4444;
          font-style: italic;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 1.2rem;
          font-size: 1.2rem;
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          width: 100%;
          font-family: var(--font-heading);
          letter-spacing: 2px;
          cursor: pointer;
        }

        .btn-primary {
          background: rgba(197, 160, 89, 0.1);
          color: var(--color-gold);
          border: 1px solid var(--color-gold);
        }

        .btn-primary:hover {
          background: var(--color-gold);
          color: var(--color-black);
          box-shadow: 0 0 25px rgba(197, 160, 89, 0.5);
          transform: translateY(-3px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--color-text-muted);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          color: var(--color-text);
          border-color: var(--color-text);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-3px);
        }

        label {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.8rem;
          color: var(--color-gold-light);
          font-family: var(--font-heading);
          letter-spacing: 1px;
        }

        input, textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(197, 160, 89, 0.2);
          color: var(--color-text);
          padding: 1rem 1.2rem;
          font-family: var(--font-body);
          font-size: 1.1rem;
          border-radius: 6px;
          outline: none;
          transition: all 0.3s;
          resize: none;
        }

        input:focus, textarea:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.1);
          background: rgba(10, 10, 10, 0.8);
        }

        .password-wrapper {
            position: relative;
        }
        
        .eye-btn {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .eye-btn:hover { color: var(--color-gold); }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          color: var(--color-text-muted);
          transition: color 0.3s;
        }
        
        .text-btn:hover {
          color: var(--color-text);
        }

        .submit-btn {
          background: transparent;
          color: var(--color-gold);
          border: 1px solid var(--color-gold);
          padding: 0.8rem 2.2rem;
          font-size: 1.1rem;
          border-radius: 6px;
          transition: all 0.3s;
          cursor: pointer;
          font-family: var(--font-heading);
          letter-spacing: 1px;
        }

        .submit-btn:hover:not(:disabled) {
          background: rgba(197, 160, 89, 0.15);
          box-shadow: 0 0 20px rgba(197, 160, 89, 0.3);
        }
        
        .submit-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            border-color: rgba(197, 160, 89, 0.2);
            color: rgba(197, 160, 89, 0.2);
        }

        .gold-glow {
            box-shadow: 0 0 10px rgba(197, 160, 89, 0.1);
        }

        .fade-in { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

        .success-message {
          font-size: 3.5rem;
          color: var(--color-gold);
          text-shadow: 0 0 30px rgba(197, 160, 89, 0.6);
          animation: scaleUpFade 2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          text-align: center;
          font-family: var(--font-heading);
        }

        .door-glow { animation: pulse 3s infinite; }

        .submitting-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 0;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(197, 160, 89, 0.1);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUpFade {
          0% { opacity: 0; transform: scale(0.8); letter-spacing: 10px; }
          60% { opacity: 1; transform: scale(1.05); letter-spacing: 2px; }
          100% { opacity: 1; transform: scale(1); letter-spacing: 4px; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .text-center { text-align: center; }
        .text-xs { font-size: 0.8rem; }
        .text-sm { font-size: 0.9rem; }
        .block { display: block; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        
        @media (max-width: 480px) {
          .title { font-size: 2rem !important; }
          .success-message { font-size: 2.22rem; }
          .form-panel { padding: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
