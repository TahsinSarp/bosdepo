import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClanProvider, useClan } from './context/ClanContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Placeholder from './pages/Placeholder';

import Arsiv from './pages/Arsiv';
import SessizOda from './pages/SessizOda';
import Teoriler from './pages/Teoriler';
import Home from './pages/Home';
import Salon from './pages/Salon';
import GorevTahtasi from './pages/GorevTahtasi';
import Istatistikler from './pages/Istatistikler';
import BizKimiz from './pages/BizKimiz';
import AdminPanel from './pages/AdminPanel'; // Added Admin Panel

const ProtectedRoute = ({ children }) => {
  const { user } = useClan();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="home" element={<Home />} />
        <Route path="salon" element={<Salon />} />
        <Route path="arsiv" element={<Arsiv />} />
        <Route path="sessiz-oda" element={<SessizOda />} />
        <Route path="teoriler" element={<Teoriler />} />
        <Route path="gorev-tahtasi" element={<GorevTahtasi />} />
        <Route path="istatistikler" element={<Istatistikler />} />
        <Route path="biz-kimiz" element={<BizKimiz />} />
        <Route path="admin" element={<AdminPanel />} /> {/* Added Admin Panel Route */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ClanProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClanProvider>
  );
}

export default App;
