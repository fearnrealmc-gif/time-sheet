
import { GoogleGenAI } from "@google/genai";
import { AttendanceEntry, Worker } from '../types';

// IMPORTANT: This is a placeholder for a real API key.
// In a real application, this should be handled securely and not hardcoded.
const API_KEY = process.env.API_KEY; 

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export const generateAttendanceSummary = async (
  cycleLabel: string,
  workers: Worker[],
  entries: AttendanceEntry[]
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Gemini API key not configured. Please set the API_KEY environment variable. This is a placeholder response. The AI summary would highlight attendance trends, identify workers with perfect attendance or frequent absences, and flag potential issues for HR to review.");
  }
  
  try {
    const workerMap = new Map(workers.map(w => [w.id, w.full_name]));
    const simplifiedEntries = entries.map(e => ({
      worker_name: workerMap.get(e.worker_id) || 'Unknown Worker',
      date: e.date,
      status: e.status,
      overtime_hours: e.overtime_hours || 0,
    }));

    const prompt = `
      You are an HR analyst. Based on the following attendance data for the cycle "${cycleLabel}", provide a concise summary for an HR manager.

      The data contains a list of attendance entries with worker name, date, status, and overtime hours. The status codes are:
      - P: Present
      - A: Absent
      - AL: Annual Leave
      - SL: Sick Leave
      - EL: Emergency Leave
      - UL: Unpaid Leave
      - PH: Public Holiday

      Your summary should include:
      1. An overview of the general attendance rate.
      2. Identification of any workers with notable attendance patterns (e.g., perfect attendance, high number of sick leaves, consecutive absences).
      3. Analysis of overtime data: highlight workers with high overtime and any potential patterns.
      4. Any potential compliance or workforce management issues that the data might suggest.
      5. Format the output in clean markdown.

      Data:
      ${JSON.stringify(simplifiedEntries, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    if (error instanceof Error) {
        return `Failed to generate AI summary: ${error.message}`;
    }
    return "An unknown error occurred while generating the AI summary.";
  }
};