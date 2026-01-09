import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, AlignLeft, Type, Hash, GripVertical, CheckSquare, Briefcase, Users, List, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import { Job, FieldType, FormField } from '../types';
import { Store } from '../store';
import { GeminiService } from '../services/gemini';

const JobBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  
  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field-${Date.now()}`,
        label: '',
        type: FieldType.TEXT,
        required: false,
        options: ['Option 1', 'Option 2']
      },
    ]);
  };

  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFields(fields.map(f => {
      if (f.id !== fieldId) return f;
      const newOptions = [...(f.options || [])];
      newOptions[optionIndex] = value;
      return { ...f, options: newOptions };
    }));
  };

  const addOption = (fieldId: string) => {
    setFields(fields.map(f => {
      if (f.id !== fieldId) return f;
      return { ...f, options: [...(f.options || []), `Option ${(f.options?.length || 0) + 1}`] };
    }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(fields.map(f => {
      if (f.id !== fieldId) return f;
      const newOptions = [...(f.options || [])];
      newOptions.splice(optionIndex, 1);
      return { ...f, options: newOptions };
    }));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    if (!title || !description) {
      alert('Please fill in the basic job details.');
      return;
    }

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      department,
      description,
      requirements,
      fields,
      createdAt: new Date().toISOString(),
    };

    Store.saveJob(newJob);
    navigate('/admin');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await GeminiService.generateJobDetails(aiPrompt);
      if (result.title) setTitle(result.title);
      if (result.department) setDepartment(result.department);
      if (result.description) setDescription(result.description);
      if (result.requirements) setRequirements(result.requirements);
      
      if (result.fields) {
        const newFields = result.fields.map((f: any, idx: number) => ({
          ...f,
          id: `field-${Date.now()}-${idx}`, // ensure unique IDs
        }));
        setFields(newFields);
      }
      setShowAiModal(false);
      setAiPrompt('');
    } catch (e) {
      alert('Failed to generate job details. Please check your API key or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newFields = [...fields];
    const draggedItem = newFields[dragIndex];
    newFields.splice(dragIndex, 1);
    newFields.splice(index, 0, draggedItem);
    
    setFields(newFields);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const getTypeIcon = (type: FieldType) => {
    switch(type) {
      case FieldType.NUMBER: return <Hash className="w-3 h-3"/>;
      case FieldType.TEXTAREA: return <AlignLeft className="w-3 h-3"/>;
      case FieldType.DROPDOWN: return <List className="w-3 h-3"/>;
      case FieldType.MULTISELECT: return <CheckCircle2 className="w-3 h-3"/>;
      default: return <Type className="w-3 h-3"/>;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative">
      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> AI Job Creator
              </h3>
              <p className="text-indigo-100 text-sm mt-1">Describe the role, and we'll build the job post for you.</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] resize-none text-slate-700 placeholder-slate-400"
                placeholder="e.g., We need a Senior Product Designer for our mobile app team. They should be expert in Figma and have 5+ years experience. Ask for their portfolio and design philosophy."
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-200 transition-all"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Magic in progress...' : 'Generate Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-16 z-40 transition-all">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Listing</span>
               <span className="text-sm font-semibold text-slate-900">{title || 'Untitled Position'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-50 transition font-medium text-sm"
            >
              <Sparkles className="w-4 h-4" /> AI Assist
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-200 font-medium text-sm transform active:scale-95"
            >
              <Save className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        
        {/* JOB DETAILS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <div className="h-2 bg-indigo-600 w-full"></div>
          <div className="p-8 md:p-10 space-y-8">
            
            {/* Title & Dept */}
            <div className="space-y-6">
                <div className="relative group">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none p-0 focus:ring-0 bg-transparent leading-tight transition-colors"
                      placeholder="Job Title"
                    />
                    {!title && <div className="absolute left-0 top-full mt-1 text-xs text-red-400 font-medium hidden group-focus-within:block">Required</div>}
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all w-fit">
                        <Users className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-40 placeholder-slate-400"
                          placeholder="Department"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                 <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-indigo-600" /> Description
                 </label>
                 <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-slate-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition outline-none resize-y text-slate-700 leading-relaxed placeholder-slate-400"
                    placeholder="Describe the role, responsibilities, and why someone should join..."
                  />
            </div>

            <div>
                 <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-600" /> Requirements</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">For AI Scoring</span>
                 </label>
                 <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-y text-slate-700 leading-relaxed placeholder-indigo-300"
                    placeholder="List the skills, experience, and qualifications needed. The AI uses this to rank candidates..."
                  />
            </div>
          </div>
        </div>


        {/* FORM BUILDER SECTION */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-slate-800">Application Questions</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-md">{fields.length + 2} Fields</span>
            </div>
            
            {/* Fixed Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-400 select-none cursor-not-allowed">
                    <Type className="w-4 h-4" />
                    <span className="font-medium text-sm">Full Name (Auto)</span>
                </div>
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-400 select-none cursor-not-allowed">
                    <Type className="w-4 h-4" />
                    <span className="font-medium text-sm">Email Address (Auto)</span>
                </div>
            </div>

            {/* Custom Fields Area */}
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div 
                        key={field.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white border rounded-xl transition-all duration-200 group relative overflow-hidden
                            ${dragIndex === index ? 'border-indigo-500 shadow-xl scale-[1.02] z-20 rotate-1' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}
                        `}
                    >
                        <div className="flex">
                            {/* Drag Handle */}
                            <div className="w-10 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 p-5">
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            autoFocus={!field.label}
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                            className="w-full text-lg font-semibold text-slate-800 placeholder-slate-300 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 p-1 transition-all focus:ring-0 bg-transparent"
                                            placeholder="Write your question here..."
                                        />
                                    </div>
                                    <button onClick={() => removeField(field.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="relative">
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg py-2 pl-9 pr-8 focus:bg-white focus:border-indigo-500 focus:ring-0 transition outline-none cursor-pointer hover:bg-slate-100"
                                        >
                                            <option value={FieldType.TEXT}>Short Text</option>
                                            <option value={FieldType.TEXTAREA}>Long Answer</option>
                                            <option value={FieldType.NUMBER}>Number</option>
                                            <option value={FieldType.DROPDOWN}>Dropdown</option>
                                            <option value={FieldType.MULTISELECT}>Multiple Select</option>
                                        </select>
                                        <div className="absolute left-3 top-2.5 pointer-events-none text-slate-400">
                                            {getTypeIcon(field.type)}
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer hover:text-indigo-600 transition select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-200">
                                        <input
                                            type="checkbox"
                                            className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                        />
                                        Required
                                    </label>
                                </div>

                                {/* Options Editor for Dropdown/Multiselect */}
                                {(field.type === FieldType.DROPDOWN || field.type === FieldType.MULTISELECT) && (
                                  <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                         <List className="w-3 h-3" /> Options
                                       </span>
                                    </div>
                                    <div className="space-y-2">
                                      {field.options?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group/opt">
                                           <div className={`w-2 h-2 rounded-full ${field.type === FieldType.MULTISELECT ? 'rounded-sm' : 'rounded-full'} border border-slate-300`}></div>
                                           <input 
                                             type="text" 
                                             value={opt}
                                             onChange={(e) => updateOption(field.id, idx, e.target.value)}
                                             className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-0 transition"
                                             placeholder={`Option ${idx + 1}`}
                                           />
                                           <button 
                                            onClick={() => removeOption(field.id, idx)}
                                            className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover/opt:opacity-100 transition"
                                           >
                                             <X className="w-4 h-4" />
                                           </button>
                                        </div>
                                      ))}
                                    </div>
                                    <button 
                                      onClick={() => addOption(field.id)}
                                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <button
                  onClick={addField}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition flex items-center justify-center gap-2 group"
                >
                  <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-indigo-100 transition text-inherit">
                    <Plus className="w-5 h-5" />
                  </div>
                  Add Another Question
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default JobBuilder;
