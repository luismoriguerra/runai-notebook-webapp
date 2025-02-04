import { createXai } from '@ai-sdk/xai';
import { getAIGatewayUrl } from './ai-gateway';

//https://console.x.ai/team/0b44d343-36e4-4559-b489-33686b3ef556/usage


const xai = createXai({
    baseURL: getAIGatewayUrl('grok'),
    apiKey: process.env.XGROK_API_KEY,
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
    },
});

const LLMName = 'xai';

export const xaiListModels = [
    'grok-beta',
]

export const xaiModels = xaiListModels.map(model => `${LLMName}::${model}`);

export const xaiProvider = (xaiModelName: string) => xai(xaiModelName);

