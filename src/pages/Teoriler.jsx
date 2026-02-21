import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { Brain, MessageSquare, ThumbsUp, Lock, Send, Plus } from 'lucide-react';

const Teoriler = () => {
  const { user, canAccess, addXp, notify } = useClan();

  const [theories, setTheories] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [activeDiscussion, setActiveDiscussion] = useState(null); // Theory ID
  const [replyText, setReplyText] = useState('');

  React.useEffect(() => {
    fetchTheories();
  }, []);

  const fetchTheories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/theories');
      const data = await res.json();
      setTheories(data);
    } catch (err) { console.error("Teoriler alınamadı", err); }
  };

  const canCreate = canAccess('Part Lead'); // Level 3+

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch('http://localhost:3001/api/theories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, author: user.nickname })
      });
      if (res.ok) {
        const newTheory = await res.json();
        setTheories(prev => [newTheory, ...prev]);
        setNewTitle('');
        setNewContent('');
        setIsCreating(false);
        addXp(20); // Reward for creating a theory
        notify('Teorin karanlığa fısıldandı.');
      }
    } catch (err) { console.error("Teori yaratılamadı", err); }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/theories/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const updatedTheory = await res.json();
        setTheories(prev => prev.map(t => {
          if (t.id === id) {
            if (!t.hasLiked) {
              addXp(5, t.author); // Give XP to author
              return { ...updatedTheory, hasLiked: true };
            }
          }
          return t;
        }));
      }
    } catch (err) { console.error("Beğenilemedi", err); }
  };

  const handleReply = async (theoryId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`http://localhost:3001/api/theories/${theoryId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: user.nickname, text: replyText })
      });
      if (res.ok) {
        const updatedTheory = await res.json();
        setTheories(prev => prev.map(t => t.id === theoryId ? updatedTheory : t));
        setReplyText('');
        notify('Fısıltın teoriye eklendi.');
      }
    } catch (err) { console.error("Cevap gönderilemedi", err); }
  };

  return (
    <div className="teoriler-container fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title mb-2">Teoriler Odası</h1>
          <p className="muted-text">Komplo değil, derin düşünce deneyleri.</p>
        </div>

        {canCreate ? (
          <button className="submit-btn" onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? 'İptal' : <><Plus size={18} className="mr-2" /> Yeni Teori</>}
          </button>
        ) : (
          <div className="restricted-badge">
            <Lock size={16} /> Fikir Mühürlü (Part Lead Gerekir)
          </div>
        )}
      </div>

      {isCreating && (
        <form className="glass-panel upload-form fade-in mb-8" onSubmit={handleCreate}>
          <h3 className="gold-text mb-4">Zihnindekini Dök</h3>
          <input
            type="text"
            placeholder="Teorinin Başlığı"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="styled-input mb-4"
          />
          <textarea
            placeholder="Düşünceni açıkla. Saçma olsa bile burada ciddiyetle tartışılır..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="styled-input mb-4"
            rows="5"
          />

          <button type="submit" className="submit-btn full-width" disabled={!newTitle || !newContent}>
            <Send size={18} className="mr-2" /> Fikri Ortaya At
          </button>
        </form>
      )}

      {theories.length === 0 ? (
        <div className="empty-state text-center mt-12">
          <Brain size={64} className="gold-text opacity-50 mb-4" />
          <h3 className="gold-text">Sessizlik Hakim</h3>
          <p className="muted-text">Hiçbir teori henüz ortaya atılmadı.</p>
        </div>
      ) : (
        <div className="theories-list">
          {theories.map(theory => (
            <div key={theory.id} className="theory-card glass-panel mb-6">
              <div className="theory-header flex-between mb-4">
                <h3 className="gold-text theory-title">{theory.title}</h3>
                <div className="theory-author muted-text text-sm">Yazan: {theory.author}</div>
              </div>

              <p className="theory-content mb-6">{theory.content}</p>

              <div className="theory-actions flex-between pt-4">
                <button
                  className={`action-btn ${theory.hasLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(theory.id)}
                  disabled={theory.hasLiked}
                >
                  <ThumbsUp size={16} className="mr-2" /> Destekle ({theory.likes})
                </button>

                <button
                  className={`action-btn ${activeDiscussion === theory.id ? 'active' : ''}`}
                  onClick={() => setActiveDiscussion(activeDiscussion === theory.id ? null : theory.id)}
                >
                  <MessageSquare size={16} className="mr-2" /> Tartış ({theory.replies})
                </button>
              </div>

              {activeDiscussion === theory.id && (
                <div className="discussion-area mt-6 fade-in">
                  <div className="replies-list mb-4">
                    {(theory.replyList || []).map((reply, idx) => (
                      <div key={idx} className="reply-item mb-3 pb-3">
                        <div className="flex-between mb-1">
                          <span className="gold-text font-bold text-xs">{reply.author}</span>
                          <span className="muted-text text-xs italic">{new Date(reply.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <p className="text-sm">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="reply-input-wrapper">
                    <input
                      type="text"
                      placeholder="Fikrini buraya fısılda..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="styled-input text-sm"
                    />
                    <button className="icon-btn gold-text" onClick={() => handleReply(theory.id)}>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .restricted-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(255, 0, 0, 0.1);
          color: var(--color-red);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          font-size: 0.9rem;
          border: 1px solid rgba(255, 0, 0, 0.2);
        }

        .upload-form {
          padding: 2rem;
          border-radius: var(--border-radius);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .styled-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(0, 0, 0, 0.3);
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .styled-input:focus {
          outline: none;
          border-color: var(--color-gold);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.8rem 1.5rem;
          border-radius: var(--border-radius);
          background-color: var(--color-gold);
          color: var(--color-dark);
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.2s;
        }

        .submit-btn:hover {
          background-color: var(--color-gold-dark);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          background-color: var(--color-dark-alt);
          color: var(--color-text-muted);
          cursor: not-allowed;
          transform: none;
        }

        .theory-card {
            padding: 2rem;
            border-radius: var(--border-radius);
            position: relative;
        }

        .theory-title {
            font-size: 1.5rem;
            margin: 0;
        }

        .theory-content {
            font-size: 1.1rem;
            line-height: 1.6;
            color: var(--color-text);
        }

        .theory-actions {
            border-top: 1px solid rgba(197, 160, 89, 0.1);
        }

        .action-btn {
            display: flex;
            align-items: center;
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            transition: all 0.3s;
        }

        .action-btn:hover:not(:disabled) {
            background-color: rgba(197, 160, 89, 0.1);
            color: var(--color-gold);
        }

        .action-btn.liked, .action-btn.active {
            color: var(--color-gold);
        }

        .discussion-area {
            border-top: 1px solid rgba(197, 160, 89, 0.1);
            padding-top: 1.5rem;
        }

        .reply-item {
            border-bottom: 1px solid rgba(197, 160, 89, 0.05);
            padding-bottom: 1rem;
            margin-bottom: 1rem;
        }

        .reply-input-wrapper {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .reply-input-wrapper .styled-input {
            flex: 1;
            margin-bottom: 0 !important;
        }

        .icon-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            transition: opacity 0.2s;
        }

        .icon-btn:hover { opacity: 0.8; }

        .font-bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.9rem; }
        .mr-2 { margin-right: 0.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-12 { margin-top: 3rem; }
        .pt-4 { padding-top: 1rem; }
        .full-width { width: 100%; }
        .opacity-50 { opacity: 0.5; }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
};

export default Teoriler;
