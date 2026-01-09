
import { GoogleGenAI, Type } from "@google/genai";
import { Application, Job, CandidateAnalysis, FieldType } from "../types";

// Initialize Gemini
// NOTE: In a production app, this likely happens via a backend proxy to protect the key.
// For this frontend-only demo, we use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  
  // Generate Job Details from a short prompt
  generateJobDetails: async (userPrompt: string): Promise<Partial<Job>> => {
    const model = "gemini-2.5-flash";
    
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `
          You are an expert HR consultant. 
          Create a detailed job posting based on this user request: "${userPrompt}".
          
          Return a JSON object with:
          - title: A professional job title.
          - department: The most likely department.
          - description: A compelling job description (approx 50 words).
          - requirements: A list of key requirements (skills, experience) as a text block.
          - fields: An array of 3-5 relevant screening questions to ask the applicant.
            For 'fields', include label, type (TEXT, TEXTAREA, NUMBER, DROPDOWN, MULTISELECT), required (boolean), and options (array of strings) if type is DROPDOWN/MULTISELECT.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              department: { type: Type.STRING },
              description: { type: Type.STRING },
              requirements: { type: Type.STRING },
              fields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, enum: [FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER, FieldType.DROPDOWN, FieldType.MULTISELECT] },
                    required: { type: Type.BOOLEAN },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["label", "type", "required"]
                }
              }
            },
            required: ["title", "department", "description", "requirements", "fields"]
          }
        }
      });

      if (!response.text) throw new Error("No response from AI");
      return JSON.parse(response.text);

    } catch (error) {
      console.error("AI Job Generation failed:", error);
      throw error;
    }
  },

  analyzeCandidate: async (job: Job, application: Application): Promise<CandidateAnalysis> => {
    const model = "gemini-2.5-flash";

    // Construct parts for multimodal request if PDF is present
    const parts: any[] = [];
    
    const systemPrompt = `
      Role: Expert Technical Recruiter.
      Task: Evaluate a job application against a job description.
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Key Requirements: ${job.requirements}
      
      Candidate Name: ${application.candidateName}
      Candidate Form Responses: ${JSON.stringify(application.responses)}
      
      Output: Provide a structured JSON assessment.
      - Score: 0-100 (integer) representing fit.
      - Reasoning: A brief summary of why this score was given (max 2 sentences).
      - Strengths: Array of strings (key matching skills).
      - Weaknesses: Array of strings (missing skills or concerns).
    `;

    parts.push({ text: systemPrompt });

    // Add Resume Data (PDF) or Text
    if (application.resumeData && application.resumeMimeType === 'application/pdf') {
       parts.push({
         inlineData: {
           mimeType: application.resumeMimeType,
           data: application.resumeData
         }
       });
       parts.push({ text: "Evaluate the attached resume PDF." });
    } else if (application.resumeText) {
       parts.push({ text: `Candidate Resume Text: "${application.resumeText}"` });
    } else {
       parts.push({ text: "No resume provided." });
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              reasoning: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "reasoning", "strengths", "weaknesses"],
          },
        },
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");

      return JSON.parse(resultText) as CandidateAnalysis;

    } catch (error) {
      console.error("AI Analysis failed:", error);
      return {
        score: 0,
        reasoning: "AI Analysis failed due to technical error or invalid file format.",
        strengths: [],
        weaknesses: []
      };
    }
  }
};
