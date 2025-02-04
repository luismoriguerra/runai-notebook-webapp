import { createGroq } from '@ai-sdk/groq';
import { getAIGatewayUrl } from './ai-gateway';

// https://console.groq.com/metrics
const groq = createGroq({
    //   apiKey: process.env.GROQ_API_KEY,
    baseURL: getAIGatewayUrl('groq'),
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
    },
});

const LLMName = 'groq';

//https://console.groq.com/docs/models
//https://console.groq.com/settings/limits
export const groqListModels = [
    'llama-3.3-70b-versatile', //	128k	32,768 // 6,000	TPM // 100,000 TPD
    'llama-3.1-8b-instant', //		128k	8,192
]

export const groqModels = groqListModels.map(model => `${LLMName}::${model}`);

export const groqProvider = (groqModelName: string) => groq(groqModelName);