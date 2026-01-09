import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Job, Application } from '../types';
import { Store } from '../store';
import { GeminiService } from '../services/gemini';

const CandidateList: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>();
  const [apps, setApps] = useState<Application[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      setJob(Store.getJob(jobId));
      setApps(Store.getApplications(jobId).sort((a, b) => 
        (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0)
      ));
    }
  }, [jobId]);

  const handleAnalyze = async (app: Application) => {
    if (!job) return;
    setAnalyzingId(app.id);
    
    const analysis = await GeminiService.analyzeCandidate(job, app);
    
    const updatedApp = { ...app, aiAnalysis: analysis };
    Store.updateApplication(updatedApp);
    
    // Update local state
    setApps(prev => prev.map(a => a.id === app.id ? updatedApp : a).sort((a, b) => 
        (b.aiAnalysis?.score || 0) - (a.aiAnalysis?.score || 0)
    ));
    setAnalyzingId(null);
    setExpandedId(app.id); // Auto expand to show result
  };

  const handleAnalyzeAll = async () => {
      // In a real app, use a queue. Here strictly sequential for demo stability.
      const unanalyzed = apps.filter(a => !a.aiAnalysis);
      for (const app of unanalyzed) {
          await handleAnalyze(app);
      }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
       <button onClick={() => navigate('/admin')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{job.title} <span className="text-slate-400 font-normal">Candidates</span></h1>
          <p className="text-slate-500 text-sm mt-1">{apps.length} total applications</p>
        </div>
        {apps.some(a => !a.aiAnalysis) && (
            <button 
                onClick={handleAnalyzeAll}
                disabled={!!analyzingId}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
            >
                <Sparkles className="w-4 h-4" />
                {analyzingId ? 'Analyzing...' : 'Analyze Pending Candidates'}
            </button>
        )}
      </div>

      <div className="space-y-4">
        {apps.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">No candidates have applied yet.</p>
            </div>
        )}

        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition hover:shadow-md">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {app.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{app.candidateName}</h3>
                  <p className="text-sm text-slate-500">{app.candidateEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {app.aiAnalysis ? (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(app.aiAnalysis.score)}`}>
                    <Sparkles className="w-3 h-3" />
                    {app.aiAnalysis.score}% Match
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAnalyze(app); }}
                    disabled={analyzingId === app.id}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    {analyzingId === app.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Analyze Fit
                  </button>
                )}
                
                <button 
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
                >
                    {expandedId === app.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Expanded Detail View */}
            {expandedId === app.id && (
              <div className="border-t border-slate-100 bg-slate-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Candidate Submission</h4>
                   <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-3">
                      <div>
                        <span className="font-medium text-slate-700">Resume Text Preview:</span>
                        <p className="text-slate-500 line-clamp-4 mt-1 font-mono text-xs bg-slate-50 p-2 rounded">{app.resumeText}</p>
                      </div>
                      {Object.entries(app.responses).map(([key, val]) => {
                          const field = job.fields.find(f => f.id === key);
                          return (
                             <div key={key}>
                                <span className="font-medium text-slate-700">{field?.label || 'Question'}:</span>
                                <p className="text-slate-600">{val}</p>
                             </div>
                          );
                      })}
                   </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Analysis</h4>
                    {app.aiAnalysis ? (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-4">
                             <div>
                                 <h5 className="font-semibold text-slate-900 mb-1">Reasoning</h5>
                                 <p className="text-slate-600">{app.aiAnalysis.reasoning}</p>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Strengths
                                    </h5>
                                    <ul className="list-none space-y-1">
                                        {app.aiAnalysis.strengths.map((s, i) => (
                                            <li key={i} className="text-slate-600 text-xs flex items-start">
                                                <span className="mr-1.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Weaknesses
                                    </h5>
                                    <ul className="list-none space-y-1">
                                        {app.aiAnalysis.weaknesses.map((s, i) => (
                                            <li key={i} className="text-slate-600 text-xs flex items-start">
                                                <span className="mr-1.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border border-dashed border-slate-300 rounded-lg">
                            Analysis not run yet.
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;
