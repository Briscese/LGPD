import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TermsPage from './components/TermsPage';
import UserPage from './components/UserPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
