import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Briefcase, Calendar, ArrowRight, BarChart3 } from 'lucide-react';
import { Store } from '../store';

const AdminDashboard: React.FC = () => {
  const jobs = Store.getJobs();
  const navigate = useNavigate();
  
  const getApplicantCount = (jobId: string) => Store.getApplications(jobId).length;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage roles, track applicants, and leverage AI insights.</p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 hover:shadow-indigo-200 font-medium"
        >
          <Plus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
             <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Your job board is empty</h3>
          <p className="text-slate-500 mb-8 max-w-md">Create your first job posting to start collecting applications and using AI to screen candidates.</p>
          <Link to="/admin/create" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2 border-b-2 border-indigo-100 hover:border-indigo-600 transition-all pb-1">
            Create Job Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
             const count = getApplicantCount(job.id);
             return (
              <div
                key={job.id}
                onClick={() => navigate(`/admin/job/${job.id}`)}
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-700 transition">
                    {job.department}
                  </span>
                  <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition">{job.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
                  {job.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className={`w-4 h-4 ${count > 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${count > 0 ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {count} <span className="font-normal text-slate-500 text-xs">Candidates</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
