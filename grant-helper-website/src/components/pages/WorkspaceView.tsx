import { useState } from 'react';
import { supabase } from '../../config/supabase';
import './EmptyState.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Demo: Manually enter your Google Form ID and entry IDs here.
 * - Form ID: from the form URL .../d/e/FORM_ID/viewform
 * - Entry IDs: from "prefill" link when editing the form, or from the form's HTML (name="entry.XXXXX")
 * - Questions: used by Gemini to generate answers; keys must match GOOGLE_FORM_ENTRY_IDS.
 */
const GOOGLE_FORM_ID = '1FAIpQLSeqewu_zjiu7TnUiAyRCT57i9lkeRbALArLXi6DdO43OhL5Wg';
const GOOGLE_FORM_ENTRY_IDS: Record<string, string> = {
  impact: 'entry.216607139',
  use_of_funds: 'entry.1232879177',
  problem_solution: 'entry.76808297',
  goal: 'entry.344212770',
};

const GOOGLE_FORM_QUESTIONS: Record<string, string> = {
  impact: "Please detail your organization's measurable impact over the last 12 months. Provide specific metrics on the demographics and total number of individuals served by your primary program. (Max 200 words)",
  use_of_funds: "If awarded this $15,000 grant, exactly how will the funds be allocated? Please explain how this aligns with your current operating budget and historical funding. (Max 250 words).",
  problem_solution: "Describe the specific community need your program addresses. How does your methodology uniquely solve this problem compared to other existing services in the area? (Max 300 words).",
  goal: "Funding is not guaranteed in perpetuity. What is your organization's long-term sustainability plan to continue this program after this grant period ends? (Max 150 words).",
};

interface WorkspaceViewProps {
  organizationProfile?: string;
  /** Optional. When set and Supabase has document_chunks for this user, they are used as context for Gemini. */
  userId?: string;
}

export default function WorkspaceView({ organizationProfile = '', userId }: WorkspaceViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateNewApplication = async () => {
    if (!GOOGLE_FORM_ID?.trim()) {
      setError('Please set GOOGLE_FORM_ID in WorkspaceView.tsx for this demo.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Resolve userId: prop or Supabase session (for document context)
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        resolvedUserId = session?.user?.id ?? undefined;
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a helpful grant writing assistant. You are given a list of questions and a context. You need to answer the questions based on the context. Do not make up any information and do not include any other text than the answers to the questions. Do not go over the word limit specified within the quesiton.`,
      });

      async function generateAnswer(question: string): Promise<string> {
        const prompt = `
          You are writing a strong, professional nonprofit grant application.
          
          Answer the following question clearly, persuasively, and concisely.
          
          Question:
          ${question}
          `;
      
        const result = await model.generateContent(prompt);
      
        return result.response.text().trim();
      }
      
      async function generateFormAnswers(): Promise<URLSearchParams> {
        const params = new URLSearchParams();
      
        const entries = Object.keys(GOOGLE_FORM_ENTRY_IDS);
      
        const answers = await Promise.all(
          entries.map(async (key) => {
            const question = GOOGLE_FORM_QUESTIONS[key];
            const entryId = GOOGLE_FORM_ENTRY_IDS[key];
      
            const answer = await generateAnswer(question);
      
            return { entryId, answer };
          })
        );
      
        for (const { entryId, answer } of answers) {
          params.append(entryId, answer);
        }
      
        return params;
      }

      const answers = new URLSearchParams({
        'entry.216607139': organizationProfile,
        'entry.1232879177': '15000',
        'entry.76808297': '30000',
        'entry.344212770': '15000'
      });

      // POST: form config + questions; server uses Gemini + Supabase docs to fill URLSearchParams and returns pre-fill URL
      const res = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSeqewu_zjiu7TnUiAyRCT57i9lkeRbALArLXi6DdO43OhL5Wg/formResponse', {
        method: 'POST',
        body: JSON.stringify({
          formId: GOOGLE_FORM_ID,
          organizationProfile: organizationProfile || undefined,
          entryIds: GOOGLE_FORM_ENTRY_IDS,
          questions: GOOGLE_FORM_QUESTIONS,
          ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `Request failed: ${res.status}`);
      }
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error('No pre-fill URL returned');
      // Open the pre-filled form in a new tab (GET)
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">✍️</div>
      <h2 className="empty-state-title">Your AI-Powered Grant Writing Workspace</h2>
      <p className="empty-state-description">
        Draft, refine, and perfect your grant applications with AI assistance.
        Answer key questions and let our AI help you craft compelling narratives
        that resonate with funders.
      </p>
      <div className="empty-state-actions">
        <button
          className="btn-primary"
          onClick={handleCreateNewApplication}
          disabled={loading}
        >
          {loading ? 'Generating answers…' : 'Create New Application'}
        </button>
        <button className="btn-secondary">View Templates</button>
      </div>
      {error && (
        <p className="upload-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3 className="feature-title">AI Draft Generation</h3>
          <p className="feature-text">
            Answer questions about your project and get AI-generated draft responses.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3 className="feature-title">Iterative Refinement</h3>
          <p className="feature-text">
            Edit and refine AI suggestions to match your organization's voice.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Version Control</h3>
          <p className="feature-text">
            Track changes and maintain different versions of your applications.
          </p>
        </div>
      </div>
    </div>
  );
}
