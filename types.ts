export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
  MULTISELECT = 'MULTISELECT',
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For Dropdown/Multiselect
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string; // Key for AI matching
  fields: FormField[];
  createdAt: string;
}

export interface CandidateAnalysis {
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  responses: Record<string, string>; // fieldId -> answer
  resumeText?: string; // Fallback text
  resumeData?: string; // Base64 encoded file data (for PDFs)
  resumeMimeType?: string; // e.g., 'application/pdf'
  submittedAt: string;
  aiAnalysis?: CandidateAnalysis;
}
