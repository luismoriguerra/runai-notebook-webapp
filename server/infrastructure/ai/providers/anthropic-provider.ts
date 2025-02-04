import { createAnthropic } from '@ai-sdk/anthropic';
import { getAIGatewayUrl } from './ai-gateway';

const anthropic = createAnthropic({
    baseURL: getAIGatewayUrl('anthropic'),
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
    },
});

const LLMName = 'anthropic';

export const anthropicListModels = [
    'claude-3-5-sonnet-latest',
]

export const anthropicModels = anthropicListModels.map(model => `${LLMName}::${model}`);

export const anthropicProvider = (anthropicModelName: string) => anthropic(anthropicModelName); 