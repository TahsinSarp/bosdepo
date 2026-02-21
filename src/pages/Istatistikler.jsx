import React from 'react';
import { useClan } from '../context/ClanContext';
import { Flame, Star, Zap, AlignLeft } from 'lucide-react';

const Istatistikler = () => {
  const { users, messages } = useClan();

  const activeUsers = Object.values(users);

  // Calc "En Çok Fısıldayanlar" (messages count)
  const msgStats = {};
  messages.forEach(m => {
    if (!m.isSystem) {
      msgStats[m.author] = (msgStats[m.author] || 0) + 1;
    }
  });

  const formatStats = (statsObj, maxCount = 5) => {
    return Object.entries(statsObj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxCount);
  };

  const topWhisperers = formatStats(msgStats);

  // Top XP
  const topXp = [...activeUsers]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)
    .map(u => ({ name: u.nickname, count: u.xp }));

  // Placeholder for top respected (likes in theories). In a full app, theories would be in global context too.
  const topRespected = [...activeUsers]
    .sort((a, b) => b.badges.length - a.badges.length)
    .slice(0, 5)
    .map(u => ({ name: u.nickname, count: u.badges.length }));

  return (
    <div className="stats-container fade-in">
      <div className="stats-header text-center">
        <h1 className="page-title">Topluluk İstatistikleri</h1>
        <p className="muted-text">Rakamlar yalan söylemez, gölgeler bile iz bırakır.</p>
      </div>

      <div className="stats-grid mt-12">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper mb-4">
            <Flame size={32} className="burgundy-text" />
          </div>
          <h3 className="gold-text mb-6">En Çok Fısıldayanlar</h3>
          <ul className="leaderboard">
            {topWhisperers.map((user, index) => (
              <li key={index}>
                <span className="rank">{index + 1}</span>
                <span className="name">{user.name}</span>
                <span className="score">{user.count} mesaj</span>
              </li>
            ))}
          </ul>
          {topWhisperers.length === 0 && <p className="muted-text text-sm">Sessizlik hakim.</p>}
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper mb-4">
            <Star size={32} className="gold-text" />
          </div>
          <h3 className="gold-text mb-6">En Çok Onaylananlar (Rozet Zenginleri)</h3>
          <ul className="leaderboard">
            {topRespected.map((user, index) => (
              <li key={index}>
                <span className="rank">{index + 1}</span>
                <span className="name">{user.name}</span>
                <span className="score">{user.count} rozet</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper mb-4">
            <Zap size={32} className="text-blue-400" />
          </div>
          <h3 className="gold-text mb-6">En Saygın Olanlar (XP)</h3>
          <ul className="leaderboard">
            {topXp.map((user, index) => (
              <li key={index}>
                <span className="rank">{index + 1}</span>
                <span className="name">{user.name}</span>
                <span className="score">{user.count} XP</span>
              </li>
            ))}
          </ul>
        </div>
      </div>            <style>{`
        .stats-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .stat-card {
          padding: 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .stat-icon-wrapper {
          display: flex;
          justify-content: center;
        }
        
        .leaderboard {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
          flex: 1;
        }
        
        .leaderboard li {
          display: flex;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }
        
        .leaderboard li:last-child {
          border-bottom: none;
        }
        
        .leaderboard .rank {
          font-family: var(--font-heading);
          color: var(--color-gold);
          font-weight: bold;
          font-size: 1.2rem;
          width: 30px;
        }
        
        .leaderboard .name {
          flex: 1;
          color: var(--color-text);
        }
        
        .leaderboard .score {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        
        .text-blue-400 { color: #60a5fa; }
      `}</style>
    </div>
  );
};

export default Istatistikler;
