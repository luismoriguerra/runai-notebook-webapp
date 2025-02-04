import { createMistral } from '@ai-sdk/mistral';
import { getAIGatewayUrl } from './ai-gateway';
// https://console.mistral.ai/usage/
const mistral = createMistral({
    baseURL: getAIGatewayUrl('mistral'),
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
    },
});

const LLMName = 'mistral';

export const mistralListModels = [
    'mistral-large-latest',
    'pixtral-large-latest',
]

export const mistralModels = mistralListModels.map(model => `${LLMName}::${model}`);

export const mistralProvider = (mistralModelName: string) => mistral(mistralModelName);