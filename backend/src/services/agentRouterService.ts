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
    // 1. Fetch live system configuration from MongoDB
    let config = await SystemConfig.findOne();
    
    const authToken = config?.anthropicAuthToken || process.env.ANTHROPIC_AUTH_TOKEN || '';
    const baseUrl = (config?.anthropicBaseUrl || process.env.ANTHROPIC_BASE_URL || 'https://agentrouter.org').replace(/\/$/, '');
    const model = config?.anthropicModel || process.env.ANTHROPIC_MODEL || 'claude-opus-4-6';

    // 2. If Auth Token is configured, dispatch live AgentRouter API call
    if (authToken.trim()) {
      try {
        const systemPrompt = `You are Preplyx AI Tutor, an expert AI assistant for CBT exam preparation (${context?.exam || 'JAMB'}, ${context?.subject || 'General'}). Provide clear, concise, and structured guidance. When asked to explain without revealing answers, never spoil the correct option (A, B, C, D).`;
        
        const fullUserMessage = `Question Context: "${context?.questionText || ''}"\nUser Request: ${prompt}`;

        // Attempt Anthropic /v1/messages endpoint on AgentRouter
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

        if (response.data && response.data.content && Array.isArray(response.data.content)) {
          const textBlock = response.data.content.find((c: any) => c.type === 'text');
          if (textBlock && textBlock.text) {
            return textBlock.text;
          }
        }

        if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
          return response.data.choices[0].message.content;
        }
      } catch (apiError: any) {
        console.error('AgentRouter API Error:', apiError?.response?.data || apiError.message);
      }
    }

    // 3. Fallback intelligent response generator if API key is not configured or fails
    const qText = context?.questionText || 'the active question';
    const subj = context?.subject || 'CBT Subject';
    const exam = context?.exam || 'JAMB';
    const exp = context?.explanation;
    const lowerQuery = prompt.toLowerCase();

    if (lowerQuery.includes('without answering') || lowerQuery.includes('without revealing') || lowerQuery.includes('concept') || lowerQuery.includes('no answer') || lowerQuery.includes('in detail')) {
      return `**In-Depth Concept Explanation for ${subj} (AgentRouter AI Engine):**\n\n` +
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
