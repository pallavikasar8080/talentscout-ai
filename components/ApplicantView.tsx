import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, FileText, X, Briefcase, Send } from 'lucide-react';
import { Job, Application, FieldType } from '../types';
import { Store } from '../store';

const ApplicantView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [resumeText, setResumeText] = useState('');
  const [resumeData, setResumeData] = useState<{data: string, mimeType: string} | undefined>();
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (jobId) {
      const foundJob = Store.getJob(jobId);
      setJob(foundJob);
    }
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
     if (file) {
      setFileName(file.name);
      
      // Handle PDF Reading for AI
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64String = (ev.target?.result as string).split(',')[1]; // Strip data:application/pdf;base64,
          setResumeData({
            data: base64String,
            mimeType: 'application/pdf'
          });
          setResumeText("PDF Resume Attached"); // Placeholder for UI
        };
        reader.readAsDataURL(file);
      } 
      // Handle DOC/DOCX (Text extraction difficult client-side without heavy libs, simplified for demo)
      else {
        // For non-PDF docs, we can't easily extract text client-side in this specific environment.
        // We will allow the upload but warn the user or just proceed.
        setResumeText(`Document Attached: ${file.name}`);
        setResumeData(undefined);
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleMultiSelectChange = (fieldId: string, option: string, checked: boolean) => {
    const currentVal = responses[fieldId] ? responses[fieldId].split(', ') : [];
    let newVal = [];
    if (checked) {
      newVal = [...currentVal, option];
    } else {
      newVal = currentVal.filter(v => v !== option);
    }
    setResponses({ ...responses, [fieldId]: newVal.join(', ') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);

    const application: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      candidateName: name,
      candidateEmail: email,
      responses,
      resumeText: resumeText || "No resume text provided.",
      resumeData: resumeData?.data,
      resumeMimeType: resumeData?.mimeType,
      submittedAt: new Date().toISOString(),
    };

    await Store.saveApplication(application);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100 max-w-lg w-full text-center border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Sent!</h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            Thank you for applying to <strong className="text-indigo-600">{job?.title}</strong>. <br/>We'll review your profile and get back to you shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition font-semibold text-lg shadow-lg"
          >
            Return to Job Board
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-full mb-4 animate-bounce"></div>
                <p className="text-slate-400 font-medium">Loading job details...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
             <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-400 blur-3xl"></div>
             <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full bg-purple-400 blur-3xl"></div>
         </div>
         
         <div className="max-w-3xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-medium mb-6 backdrop-blur-sm">
                <Briefcase className="w-3 h-3 mr-2" />
                {job.department}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">{job.title}</h1>
            <div className="prose prose-lg prose-invert mx-auto opacity-90 line-clamp-3">
                 {job.description}
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-20 relative z-20 pb-20">
        
        {/* Job Description Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8 border border-slate-100">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">About the Role</h3>
             <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mb-8">{job.description}</p>
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Requirements</h3>
             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
             </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
             Apply Now
          </h2>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none font-medium"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Resume / CV (PDF, DOC, DOCX) <span className="text-red-500">*</span></label>
                <div 
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ease-in-out
                        ${dragActive 
                            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-lg' 
                            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                        }
                        ${fileName ? 'bg-green-50 border-green-300' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  
                  {fileName ? (
                       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                               <FileText className="w-6 h-6" />
                           </div>
                           <span className="text-slate-900 font-medium">{fileName}</span>
                           <button 
                             type="button" 
                             onClick={(e) => {
                                 e.preventDefault();
                                 setFileName('');
                                 setResumeText('');
                                 setResumeData(undefined);
                             }}
                             className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 hover:bg-red-50"
                           >
                             <X className="w-3 h-3" /> Remove
                           </button>
                       </div>
                  ) : (
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                        <div className={`p-4 rounded-full bg-slate-100 mb-4 text-slate-400 transition ${dragActive ? 'text-indigo-600 bg-indigo-100' : 'group-hover:bg-white group-hover:shadow-md'}`}>
                             <Upload className="w-8 h-8" />
                        </div>
                        <span className="text-lg font-semibold text-slate-900 mb-1">
                          {dragActive ? 'Drop it like it\'s hot' : 'Upload your resume'}
                        </span>
                        <p className="text-sm text-slate-500 mb-4">Drag and drop or click to browse</p>
                        <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                            PDF, DOC, DOCX Only
                        </span>
                      </label>
                  )}
                </div>
                
                {/* Fallback / Paste Text - Keeping this as a utility, but main upload is emphasized */}
                {(!fileName && resumeText) || (fileName) ? null : (
                    <div className="mt-4">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500">Or paste resume text manually</span>
                        </div>
                        <textarea
                          required={!fileName}
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          rows={4}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none text-sm font-mono"
                          placeholder="Paste resume content here..."
                        />
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <h3 className="font-semibold text-slate-900">Additional Questions</h3>
              {job.fields.length === 0 && <p className="text-sm text-slate-400 italic">No additional questions.</p>}
              
              {job.fields.map((field) => (
                <div key={field.id} className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === FieldType.TEXTAREA && (
                    <textarea
                      required={field.required}
                      value={responses[field.id] || ''}
                      onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none min-h-[100px]"
                    />
                  )}

                  {(field.type === FieldType.TEXT || field.type === FieldType.NUMBER) && (
                    <input
                      type={field.type === FieldType.NUMBER ? 'number' : 'text'}
                      required={field.required}
                      value={responses[field.id] || ''}
                      onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                    />
                  )}

                  {field.type === FieldType.DROPDOWN && (
                    <div className="relative">
                        <select
                            required={field.required}
                            value={responses[field.id] || ''}
                            onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Select an option...</option>
                            {field.options?.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                  )}

                  {field.type === FieldType.MULTISELECT && (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {field.options?.map((opt, idx) => {
                            const isChecked = (responses[field.id] || '').split(', ').includes(opt);
                            return (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={isChecked}
                                        onChange={(e) => handleMultiSelectChange(field.id, opt, e.target.checked)}
                                    />
                                    <span className="text-slate-700">{opt}</span>
                                </label>
                            );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                {isSubmitting ? (
                    <>Processing...</>
                ) : (
                    <>Submit Application <Send className="w-5 h-5" /></>
                )}
                </button>
                
                {!process.env.API_KEY && (
                <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-orange-50 text-orange-800 rounded-lg text-xs border border-orange-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>Demo Mode: AI analysis unavailable without API Key.</span>
                </div>
                )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantView;
