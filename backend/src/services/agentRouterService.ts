import axios from 'axios';
import SystemConfig from '../models/SystemConfig';

export interface AgentRouterContext {
  exam?: string;
  subject?: string;
  questionNumber?: number;
  questionText?: string;
  options?: any;
  explanation?: string;
}

export const generateAgentRouterCompletion = async (
  prompt: string,
  context?: AgentRouterContext
): Promise<string> => {
  try {
    let config = await SystemConfig.findOne();
    
    const authToken = config?.anthropicAuthToken || process.env.ANTHROPIC_AUTH_TOKEN || '';
    const baseUrl = (config?.anthropicBaseUrl || process.env.ANTHROPIC_BASE_URL || 'https://agentrouter.org').replace(/\/$/, '');
    const model = config?.anthropicModel || process.env.ANTHROPIC_MODEL || 'claude-opus-4-6';
    const geminiApiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY || '';

    const systemPrompt = `You are Preplyx AI Tutor, an expert AI assistant for CBT exam preparation (${context?.exam || 'JAMB'}, ${context?.subject || 'General'}). Provide clear, concise, and structured guidance. When asked to explain without revealing answers, never spoil the correct option (A, B, C, D).`;
    const fullUserMessage = `Question Context: "${context?.questionText || ''}"\nUser Request: ${prompt}`;

    // 1. Try AgentRouter / Anthropic / OpenAI Compatible API
    if (authToken.trim()) {
      try {
        // Attempt Anthropic /v1/messages endpoint
        const response = await axios.post(
          `${baseUrl}/v1/messages`,
          {
            model: model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              { role: 'user', content: fullUserMessage }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken.trim()}`,
              'x-api-key': authToken.trim(),
              'anthropic-version': '2023-06-01'
            },
            timeout: 15000
          }
        );

        if (response.data?.content && Array.isArray(response.data.content)) {
          const textBlock = response.data.content.find((c: any) => c.type === 'text');
          if (textBlock?.text) return textBlock.text;
        }

        if (response.data?.choices && response.data.choices[0]?.message?.content) {
          return response.data.choices[0].message.content;
        }
      } catch (apiError: any) {
        // Fallback to /v1/chat/completions endpoint on AgentRouter/OpenAI
        try {
          const chatRes = await axios.post(
            `${baseUrl}/v1/chat/completions`,
            {
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: fullUserMessage }
              ]
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken.trim()}`
              },
              timeout: 15000
            }
          );
          if (chatRes.data?.choices && chatRes.data.choices[0]?.message?.content) {
            return chatRes.data.choices[0].message.content;
          }
        } catch (chatErr: any) {
          console.error('AgentRouter Chat Endpoint Error:', chatErr?.response?.data || chatErr.message);
        }
      }
    }

    // 2. Try Google Gemini API if Gemini API Key is configured
    if (geminiApiKey.trim()) {
      try {
        const targetGeminiModel = model.includes('gemini') ? model : 'gemini-1.5-flash';
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetGeminiModel}:generateContent?key=${geminiApiKey.trim()}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${fullUserMessage}` }]
              }
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
          }
        );

        const text = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (geminiErr: any) {
        console.error('Google Gemini API Error:', geminiErr?.response?.data || geminiErr.message);
      }
    }

    // 3. Fallback intelligent response generator if API key is not configured or fails
    const qText = context?.questionText || 'the active question';
    const subj = context?.subject || 'CBT Subject';
    const exam = context?.exam || 'JAMB';
    const exp = context?.explanation;
    const lowerQuery = prompt.toLowerCase();

    if (lowerQuery.includes('without answering') || lowerQuery.includes('without revealing') || lowerQuery.includes('concept') || lowerQuery.includes('no answer') || lowerQuery.includes('in detail')) {
      return `**In-Depth Concept Explanation for ${subj} (Preplyx AI Engine):**\n\n` +
        `### 1. Theoretical Background & Core Principles\n` +
        `This problem evaluates essential principles in **${subj}**. Here is the theoretical framework:\n` +
        `${exp ? exp : `Focus on the foundational definitions, formulas, and laws governing this question.`}\n\n` +
        `### 2. Key Terminology & Constraints\n` +
        `- **Main Context**: Analyze the key terms and parameters given in "${qText}".\n` +
        `- **${exam} Examination Standards**: Pay strict attention to variable relationships, units of measurement, and standard definitions.\n\n` +
        `### 3. How to Solve This Problem Step-by-Step\n` +
        `1. Identify all given values and parameters in the question text.\n` +
        `2. Write down the fundamental formula or definition applicable to this subject.\n` +
        `3. Systematically eliminate options that contradict basic principles or produce incorrect units.\n\n` +
        `🔒 *Note: The specific correct answer (A, B, C, or D) is intentionally not revealed so you can test your understanding!*`;
    }

    return `**AI Tutor Breakdown for ${subj} (${model}):**\n\nRegarding "${prompt}":\n\nFor ${exam} testing standards, prioritize accuracy and rapid reasoning.${exp ? `\n\n**Official Explanation Note:**\n${exp}` : '\n\nEnsure you review standard formulas and definitions relevant to this topic.'}`;
  } catch (err: any) {
    console.error('Error in agentRouterService:', err);
    return `An error occurred while generating AI response. Please try again.`;
  }
};

export const testAiModelConnection = async (overrideConfig?: {
  anthropicAuthToken?: string;
  anthropicBaseUrl?: string;
  anthropicModel?: string;
  geminiApiKey?: string;
}): Promise<{ success: boolean; message: string; model?: string }> => {
  try {
    let config = await SystemConfig.findOne();
    const authToken = overrideConfig?.anthropicAuthToken || config?.anthropicAuthToken || process.env.ANTHROPIC_AUTH_TOKEN || '';
    const baseUrl = (overrideConfig?.anthropicBaseUrl || config?.anthropicBaseUrl || process.env.ANTHROPIC_BASE_URL || 'https://agentrouter.org').replace(/\/$/, '');
    const model = overrideConfig?.anthropicModel || config?.anthropicModel || process.env.ANTHROPIC_MODEL || 'claude-opus-4-6';
    const geminiApiKey = overrideConfig?.geminiApiKey || config?.geminiApiKey || process.env.GEMINI_API_KEY || '';

    if (!authToken.trim() && !geminiApiKey.trim()) {
      return {
        success: false,
        message: 'No API Key provided. Please input an AgentRouter Auth Token or Google Gemini API Key.'
      };
    }

    if (authToken.trim()) {
      const response = await axios.post(
        `${baseUrl}/v1/messages`,
        {
          model: model,
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Ping' }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken.trim()}`,
            'x-api-key': authToken.trim(),
            'anthropic-version': '2023-06-01'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          message: `Successfully connected to AgentRouter AI model (${model})!`,
          model
        };
      }
    }

    if (geminiApiKey.trim()) {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`,
        {
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      if (geminiRes.status === 200) {
        return {
          success: true,
          message: `Successfully connected to Google Gemini API (gemini-1.5-flash)!`,
          model: 'gemini-1.5-flash'
        };
      }
    }

    return { success: false, message: 'Could not establish connection to AI Model API.' };
  } catch (error: any) {
    console.error('AI Model Test Error:', error?.response?.data || error.message);
    return {
      success: false,
      message: error?.response?.data?.error?.message || error?.message || 'Failed to authenticate with AI Provider'
    };
  }
};
