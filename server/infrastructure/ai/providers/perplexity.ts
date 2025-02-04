import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getAIGatewayUrl } from './ai-gateway';
// import { createOpenAI } from '@ai-sdk/openai';

const wrappedPerplexity = createOpenAICompatible({
    name: 'perplexity',
    // apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: getAIGatewayUrl('perplexity-ai'),
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
});

// export const wrappedPerplexity = createOpenAI({
//     baseURL: getAIGatewayUrl('perplexity-ai'),
//     apiKey: process.env.PERPLEXITY_API_KEY,
//     headers: {
//         'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
//     },
// });


export const LLMName = 'perplexity';
export const perplexityListModels = [
    'sonar-pro',
    'sonar'
]

export const perplexityProvider = (model: string) => wrappedPerplexity(model);

export const perplexityModels = perplexityListModels.map(model => `${LLMName}::${model}`);