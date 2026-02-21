import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useClan } from '../context/ClanContext';
import {
  Users,
  MessageCircle,
  Archive,
  VolumeX,
  BrainCircuit,
  Target,
  BarChart2,
  Info,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout, notifications } = useClan();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMobileOpen(false);

  if (!user) {
    return <Outlet />; // Application form handles unauthenticated
  }

  return (
    <div className="layout-container">
      <div className="candle-glow"></div>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <h2 className="mobile-header-title">Hemsaye</h2>
        <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar glass-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="clan-title">Hemsaye</h2>
          <div className="user-info">
            <p className="nickname gold-text">{user.nickname}</p>
            <p className="rank muted-text">{user.rank}</p>
          </div>
        </div>

        <div className="nav-links" onClick={closeMenu}>
          <div className="nav-section">
            <h4>Karargah</h4>
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={18} /> Profil
            </NavLink>
            <NavLink to="/salon" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <MessageCircle size={18} /> Ana Salon
            </NavLink>
            <NavLink to="/arsiv" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Archive size={18} /> Arşiv
            </NavLink>
          </div>

          <div className="nav-section">
            <h4>Gizli Bölmeler</h4>
            <NavLink to="/sessiz-oda" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <VolumeX size={18} /> Sessiz Oda
            </NavLink>
            <NavLink to="/teoriler" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <BrainCircuit size={18} /> Teoriler Odası
            </NavLink>
          </div>

          <div className="nav-section">
            <h4>Aktiviteler</h4>
            <NavLink to="/gorev-tahtasi" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Target size={18} /> Görev Tahtası
            </NavLink>
            <NavLink to="/istatistikler" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeMenu}>
              <BarChart2 size={18} /> İstatistikler
            </NavLink>
            {user?.rank === 'Admin' && (
              <NavLink to="/admin" className={({ isActive }) => `nav-item admin-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <Target size={18} /> Yönetim
              </NavLink>
            )}
          </div>

          <div className="nav-section">
            <h4>Kültür</h4>
            <NavLink to="/biz-kimiz" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Info size={18} /> Biz Kimiz?
            </NavLink>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Çıkış (Kaçış)
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      {/* Notifications overlay */}
      <div className="notifications">
        {notifications.map((n, i) => (
          <div key={i} className="notification-toast glass-panel">
            {n}
          </div>
        ))}
      </div>

      <style>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        .mobile-header {
          display: none;
          padding: 1rem;
          background: var(--color-navy);
          border-bottom: 1px solid var(--color-burgundy);
          align-items: center;
          justify-content: space-between;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 20;
        }

        .mobile-header-title {
          font-family: var(--font-heading);
          color: var(--color-gold);
          font-size: 1.5rem;
          margin: 0;
        }

        .menu-btn {
          background: transparent;
          color: var(--color-gold);
          border: 1px solid var(--color-gold);
          padding: 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar {
          width: var(--nav-width);
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 2rem 1rem;
          border-radius: 0;
          border-right: 1px solid rgba(197, 160, 89, 0.1);
          overflow-y: auto;
          z-index: 10;
          background: var(--color-navy); /* Ensure solid background on mobile */
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }

        .clan-title {
          font-size: 2rem;
          text-transform: uppercase;
          margin-bottom: 1rem;
          text-shadow: 0 0 10px rgba(197, 160, 89, 0.3);
        }

        .user-info p { margin: 0; }
        .user-info .nickname { font-size: 1.2rem; font-weight: bold; }
        .user-info .rank { font-size: 0.9rem; font-style: italic; opacity: 0.8; }

        .nav-links {
          flex: 1;
        }

        .nav-section {
          margin-bottom: 1.5rem;
        }

        .nav-section h4 {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          color: var(--color-burgundy-light);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
          opacity: 0.8;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 0.2rem;
          font-size: 1rem;
          border: 1px solid transparent;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(197, 160, 89, 0.05);
          border-color: rgba(197, 160, 89, 0.2);
          color: var(--color-gold-light);
        }

        .logout-btn {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0.75rem;
          background: rgba(89, 10, 24, 0.4);
          color: var(--color-text);
          border-radius: 6px;
          border: 1px solid var(--color-burgundy);
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: rgba(89, 10, 24, 0.8);
          box-shadow: 0 0 10px rgba(89, 10, 24, 0.5);
        }

        .main-content {
          margin-left: var(--nav-width);
          flex: 1;
          padding: 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .notifications {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 100;
        }

        .notification-toast {
          padding: 1rem 1.5rem;
          animation: slideIn 0.3s ease-out;
          border-left: 3px solid var(--color-gold);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            width: 80%;
            max-width: 300px;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
            padding: 5rem 1rem 1rem 1rem; /* Top padding to account for fixed header */
            width: 100%;
          }

          .notifications {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
