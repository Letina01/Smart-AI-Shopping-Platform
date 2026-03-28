import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {user && <Navbar onLogout={handleLogout} />}
        <main className={user ? "pt-20 pb-12 px-4 max-w-7xl mx-auto" : ""}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
            <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/login" />} />
            <Route path="/cart" element={user ? <Cart user={user} /> : <Navigate to="/login" />} />
            <Route path="/payment" element={user ? <Payment user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
