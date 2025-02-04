import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { getAIGatewayUrl } from './ai-gateway';
// https://openrouter.ai/models?max_price=0
// https://sdk.vercel.ai/providers/community-providers/openrouter


const LLMName = 'openrouter';

const baseUrl = getAIGatewayUrl(LLMName);

export const openRouterListModels = [
  'microsoft/phi-4', //Context 16K Max Output 16K
  'deepseek/deepseek-chat', //Context 64K Max Output 8K
  'minimax/minimax-01', //Context 1M Max Output 1M
  'anthropic/claude-3.5-sonnet:beta', //Context 16K Max Output 16K
  'perplexity/llama-3.1-sonar-huge-128k-online'
]

export const openRouterModels = openRouterListModels.map(model => `${LLMName}::${model}`);

const openrouter = createOpenRouter({
  baseURL: baseUrl,
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "X-Title": `Runai - Notebook`,
    'cf-aig-authorization': `Bearer ${process.env.CF_AIG_TOKEN}`,
  },
  extraBody: {
    provider: {
      ignore: [
        "Together",
        "Novita"
      ]
      // allow_fallbacks: false
    },
  }
});

export const openRouterProvider = (model: string) => openrouter(model);
