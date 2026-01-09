import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../store';
import { Briefcase, ArrowRight, Search, MapPin, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const jobs = Store.getJobs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Dream Role</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join forward-thinking companies building the future. 
            Simple application process, powered by AI.
          </p>
          
          <div className="relative max-w-xl mx-auto shadow-xl shadow-indigo-100/50 rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              placeholder="Search by job title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Open Positions <span className="text-slate-400 font-normal ml-2">({filteredJobs.length})</span>
          </h2>
        </div>

        <div className="grid gap-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:translate-y-[-2px] transition-all duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                          {job.department}
                       </span>
                       <span className="flex items-center text-xs text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(job.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2">{job.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed max-w-2xl">{job.description}</p>
                  </div>
                  
                  <Link
                    to={`/apply/${job.id}`}
                    className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-indigo-200 shrink-0"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
              <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;