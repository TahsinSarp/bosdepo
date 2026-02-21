import React, { useState, useRef, useEffect } from 'react';
import { useClan } from '../context/ClanContext';
import { Send, X } from 'lucide-react';

const Salon = () => {
  const { user, users, messages, addMessage, notify, addXp } = useClan();
  const [input, setInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const hour = new Date().getHours();
    if (hour === 2 && !user.badges.includes('Gece Sırdaşı')) {
      notify('Kazanıldı: Gece Sırdaşı rozeti. Karanlıkta uyanıksın.');
    }

    addMessage(user.nickname, input);
    setInput('');
  };

  const getAvatar = (authorNickname) => {
    const mem = users[authorNickname];
    return mem?.avatar || null;
  };

  const handleOpenProfile = (nickname) => {
    const foundUser = users[nickname];
    if (foundUser) {
      setSelectedProfile(foundUser);
    }
  };

  return (
    <div className="salon-container fade-in">
      <div className="salon-header">
        <h1 className="page-title">Ana Salon</h1>
        <p className="muted-text">Ortak fısıltıların kesiştiği yer.</p>
      </div>

      <div className="chat-window glass-panel">
        <div className="messages-area">
          {messages.map((msg) => {
            const isMe = msg.author === user.nickname;
            const avatar = getAvatar(msg.author);
            return (
              <div key={msg.id || Math.random()} className={'message-wrapper ' + (isMe ? 'my-message' : '')}>
                {!msg.isSystem && !isMe && (
                  <div className="chat-avatar mr-2 cursor-pointer" onClick={() => handleOpenProfile(msg.author)}>
                    {avatar ? <img src={avatar} alt="avatar" /> : msg.author?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={'message-bubble ' + (msg.isSystem ? 'system-message' : '')}>
                  {!msg.isSystem && !isMe && (
                    <div className="message-author cursor-pointer" onClick={() => handleOpenProfile(msg.author)}>{msg.author}</div>
                  )}
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>

                {!msg.isSystem && isMe && (
                  <div className="chat-avatar ml-2 cursor-pointer" onClick={() => handleOpenProfile(user.nickname)}>
                    {user.avatar ? <img src={user.avatar} alt="avatar" /> : user.nickname?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Karanlığa fısılda..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-btn">
            <Send size={20} />
          </button>
        </form>
      </div>

      {selectedProfile && (
        <div className="profile-modal-overlay fade-in" onClick={() => setSelectedProfile(null)}>
          <div className="profile-card-modal glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-profile" onClick={() => setSelectedProfile(null)}><X size={20} /></button>
            <div className="profile-card-header">
              <div className="card-avatar">
                {selectedProfile.avatar ? (
                  <img src={selectedProfile.avatar} alt="pfp" />
                ) : (
                  selectedProfile.nickname.charAt(0)
                )}
              </div>
              <h2 className="gold-text">{selectedProfile.nickname}</h2>
              <span className={`rank-badge rank-${selectedProfile.rank.replace(/\s+/g, '-').toLowerCase()}`}>
                {selectedProfile.rank}
              </span>
            </div>

            <div className="profile-card-stats mb-4">
              <div className="stat-item">
                <span className="muted-text">Kayıt:</span>
                <span className="gold-text">{new Date(selectedProfile.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="stat-item">
                <span className="muted-text">Deneyim (XP):</span>
                <span className="gold-text">{selectedProfile.xp}</span>
              </div>
            </div>

            <div className="profile-card-badges">
              <h4 className="text-xs muted-text uppercase mb-2">Rozetler</h4>
              <div className="badges-flex">
                {selectedProfile.badges.map((b, i) => (
                  <span key={i} className="badge">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .salon-container { height: calc(100vh - 4rem); display: flex; flex-direction: column; }
        .salon-header { margin-bottom: 2rem; }
        .page-title { font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--color-gold); }
        .chat-window { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0; }
        
        .messages-area { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; scrollbar-width: thin; }
        .message-wrapper { display: flex; justify-content: flex-start; align-items: flex-end; }
        .message-wrapper.my-message { justify-content: flex-end; }

        .chat-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(197, 160, 89, 0.2); border: 1px solid var(--color-gold);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-heading); font-size: 14px; color: var(--color-gold);
          overflow: hidden; flex-shrink: 0;
        }
        .chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mr-2 { margin-right: 0.5rem; }
        .ml-2 { margin-left: 0.5rem; }

        .message-bubble { max-width: 70%; background: rgba(15, 23, 42, 0.7); padding: 1rem 1.5rem; border-radius: 12px; border-bottom-left-radius: 2px; border: 1px solid rgba(197, 160, 89, 0.1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
        .my-message .message-bubble { background: rgba(89, 10, 24, 0.3); border-color: rgba(197, 160, 89, 0.2); border-bottom-left-radius: 12px; border-bottom-right-radius: 2px; }
        
        .system-message { background: transparent !important; border: 1px solid var(--color-gold) !important; text-align: center; margin: 0 auto; font-style: italic; color: var(--color-gold-light); border-radius: 8px !important; }
        
        .message-author { font-size: 0.8rem; color: var(--color-gold); margin-bottom: 0.3rem; font-family: var(--font-heading); }
        .message-text { font-size: 1.05rem; line-height: 1.4; word-wrap: break-word; }
        .message-time { font-size: 0.7rem; color: var(--color-text-muted); text-align: right; margin-top: 0.5rem; }
        
        .chat-input-area { display: flex; padding: 1.5rem; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(197, 160, 89, 0.1); }
        .chat-input-area input { flex: 1; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(197, 160, 89, 0.3); padding: 1rem 1.5rem; border-radius: 30px; color: var(--color-text); font-family: var(--font-body); font-size: 1.1rem; outline: none; transition: all 0.3s; }
        .chat-input-area input:focus { border-color: var(--color-gold); box-shadow: 0 0 15px rgba(197, 160, 89, 0.15); }
        .send-btn { background: var(--color-gold); color: var(--color-black); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 1rem; border: none; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; }
        .send-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(197, 160, 89, 0.5); }
        .cursor-pointer { cursor: pointer; }
        .profile-modal-overlay {
          position: fixed; top: 0; left: 0; bottom: 0; right: 0;
          background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }
        .profile-card-modal {
          width: 100%; max-width: 400px; padding: 2.5rem; position: relative;
          text-align: center; border: 1px solid rgba(197, 160, 89, 0.3);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        }
        .close-profile {
          position: absolute; top: 1rem; right: 1rem;
          background: transparent; border: none; color: var(--color-text-muted);
          cursor: pointer; transition: color 0.2s;
        }
        .close-profile:hover { color: var(--color-gold); }
        .card-avatar {
          width: 100px; height: 100px; margin: 0 auto 1.5rem;
          border-radius: 50%; border: 2px solid var(--color-gold);
          background: rgba(197, 160, 89, 0.1); display: flex;
          align-items: center; justify-content: center;
          font-family: var(--font-heading); font-size: 40px; color: var(--color-gold);
          overflow: hidden;
        }
        .card-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-card-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
          margin-top: 1.5rem; padding: 1rem 0; border-top: 1px solid rgba(197, 160, 89, 0.1);
          border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .stat-item .gold-text { font-family: var(--font-heading); font-size: 1.1rem; }
        .profile-card-badges { margin-top: 1.5rem; }
        .badges-flex { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
        .text-xs { font-size: 0.75rem; }
        .uppercase { text-transform: uppercase; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
};

export default Salon;
