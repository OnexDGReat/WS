import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from "./components/dashboard/dashboard";
import Partnerships from "./components/partnerships/partnerships";
import Colleges from "./components/colleges/colleges";
import Reports from "./components/reports/reports";
import Settings from "./components/settings/settings";

import AddPartnership from "./components/partnerships/add_partnership";
import EditPartnership from "./components/partnerships/edit_partnership";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Signup />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

        {/* NEW ROUTES HERE */}
        <Route path="/add-partnership" element={<AddPartnership />} />
        <Route path="/edit-partnership/:id" element={<EditPartnership />} />
      </Routes>
    </Router>
  );
}

export default App;
