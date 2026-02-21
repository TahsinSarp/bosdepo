import React, { useState, useRef } from 'react';
import { useClan, API_URL } from '../context/ClanContext';
import { Shield, Calendar, MessageSquare, Award, Camera, Check, X } from 'lucide-react';

const Home = () => {
  const { user, updateUserProfile } = useClan();
  const [isEditingWord, setIsEditingWord] = useState(false);
  const [tempWord, setTempWord] = useState(user.mostUsedWord);
  const fileInputRef = useRef(null);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await fetch(`${API_URL}/users/${user.nickname}/avatar`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const updatedUser = await res.json();
          // Assuming updateUserProfile just updates local React state since backend handled DB
          updateUserProfile(updatedUser);
        }
      } catch (err) {
        console.error("Resim yüklenemedi", err);
      }
    }
  };

  const saveWord = () => {
    if (tempWord.trim()) {
      updateUserProfile({ mostUsedWord: tempWord });
      setIsEditingWord(false);
    }
  };

  return (
    <div className="profile-container fade-in">
      <h1 className="page-title">Karargah: {user.nickname}</h1>

      <div className="profile-grid">
        <div className="profile-card glass-panel main-info">
          <div className="avatar-wrapper" onClick={handleAvatarClick} title="Resmi Değiştir">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="user-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-overlay">
              <Camera size={24} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <h2 className="gold-text mt-4">{user.nickname}</h2>
          <p className="rank-label"><Shield size={16} /> Rütbe: <span>{user.rank}</span></p>

          <div className="xp-bar-container">
            <div className="xp-label">
              <span>XP: {user.xp}</span>
              <span className="muted-text">Seviye İlerlemesi</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: Math.min(100, (user.xp % 500) / 5) + '%' }}></div>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-card glass-panel">
            <h3><Calendar size={18} /> Katılım Tarihi</h3>
            <p className="value">{formatDate(user.joinDate)}</p>
          </div>

          <div className="detail-card glass-panel flex-col-center">
            <h3><MessageSquare size={18} /> Mühürlü Kelime</h3>
            {isEditingWord ? (
              <div className="word-edit-mode">
                <input
                  type="text"
                  value={tempWord}
                  onChange={(e) => setTempWord(e.target.value)}
                  className="word-input"
                  autoFocus
                />
                <button className="icon-btn success" onClick={saveWord}><Check size={18} /></button>
                <button className="icon-btn danger" onClick={() => setIsEditingWord(false)}><X size={18} /></button>
              </div>
            ) : (
              <div className="word-display-mode" onClick={() => setIsEditingWord(true)} title="Değiştirmek için tıkla">
                <p className="value word-value">"{user.mostUsedWord}"</p>
              </div>
            )}
          </div>

          <div className="detail-card glass-panel badges-card">
            <h3><Award size={18} /> Rozetler</h3>
            <div className="badges-list">
              {user.badges.map((badge, idx) => (
                <span key={idx} className="badge">{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container { max-width: 1000px; margin: 0 auto; }
        .page-title { font-size: 2.5rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 1rem; }
        .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
        .profile-card { padding: 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; }

        .avatar-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid var(--color-gold);
          box-shadow: 0 0 20px rgba(197, 160, 89, 0.2);
        }

        .user-avatar { width: 100%; height: 100%; object-fit: cover; }
        
        .avatar-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; font-family: var(--font-heading);
          background: rgba(197, 160, 89, 0.1); color: var(--color-gold);
          text-transform: uppercase;
        }

        .avatar-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }

        .avatar-wrapper:hover .avatar-overlay { opacity: 1; }

        .rank-label { display: flex; align-items: center; gap: 8px; margin-top: 1rem; font-size: 1.1rem; color: var(--color-burgundy-light); }
        .rank-label span { color: var(--color-text); font-weight: bold; }

        .xp-bar-container { width: 100%; margin-top: 2rem; }
        .xp-label { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .xp-bar { width: 100%; height: 10px; background: rgba(0, 0, 0, 0.6); border-radius: 5px; overflow: hidden; border: 1px solid rgba(197, 160, 89, 0.2); }
        .xp-fill { height: 100%; background: linear-gradient(90deg, var(--color-burgundy), var(--color-gold)); transition: width 0.5s ease; }

        .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .detail-card { padding: 1.5rem; }
        .detail-card h3 { display: flex; align-items: center; gap: 10px; font-size: 1rem; margin-bottom: 1rem; opacity: 0.8; }
        .detail-card .value { font-size: 1.2rem; }

        .word-display-mode { cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.3s; }
        .word-display-mode:hover { background: rgba(197, 160, 89, 0.1); }
        
        .word-value { font-family: var(--font-heading); font-size: 1.5rem !important; color: var(--color-gold); font-style: italic; }

        .word-edit-mode { display: flex; gap: 0.5rem; align-items: center; }
        .word-input {
          background: rgba(0,0,0,0.5); border: 1px solid var(--color-gold);
          color: var(--color-text); padding: 0.5rem; border-radius: 4px;
          width: 150px; outline: none;
        }

        .icon-btn {
          background: transparent; border: none; cursor: pointer;
          padding: 0.3rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;
        }
        .icon-btn.success { color: #4ade80; }
        .icon-btn.danger { color: #f87171; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); }

        .badges-card { grid-column: 1 / -1; }
        .badges-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .badge { background: rgba(197, 160, 89, 0.15); border: 1px solid var(--color-gold); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; color: var(--color-gold-light); box-shadow: 0 0 10px rgba(197, 160, 89, 0.1); }

        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        .mt-4 { margin-top: 1rem; }
        
        @media (max-width: 768px) {
            .profile-grid { grid-template-columns: 1fr; }
            .profile-details { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Home;
