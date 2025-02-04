import { createOpenAI } from "@ai-sdk/openai";
import { getAIGatewayUrl } from './ai-gateway';

export const wrappedOpenai = createOpenAI({
    baseURL: getAIGatewayUrl('openai'),
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
    },
});

const LLMName = 'openai';

export const openaiListModels = [
    'gpt-4o-mini', //128,000 tokens //16,384 tokens // 200,000 TPM
    'gpt-4o', //128,000 tokens //16,384 tokens // 30,000 TPM
]

export const openaiModels = openaiListModels.map(model => `${LLMName}::${model}`);
export const openaiProvider = (openaiModelName: string) => wrappedOpenai(openaiModelName);

export const maxInferenceDuration = 30; 