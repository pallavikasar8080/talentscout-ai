import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Briefcase, LayoutDashboard } from 'lucide-react';

import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import JobBuilder from './components/JobBuilder';
import ApplicantView from './components/ApplicantView';
import CandidateList from './components/CandidateList';

const NavBar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                 <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">TalentScout</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                !isAdmin ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Applicant View
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                isAdmin ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Recruiter Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply/:jobId" element={<ApplicantView />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create" element={<JobBuilder />} />
            <Route path="/admin/job/:jobId" element={<CandidateList />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} TalentScout AI. All data stored locally.
            </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
