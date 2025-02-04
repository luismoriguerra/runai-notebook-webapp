// https://sdk.vercel.ai/providers/ai-sdk-providers
import { openRouterModels, openRouterProvider } from "./providers/open-router";


export const models = [
    ...openRouterModels,
]

export const apiProviders = {
    openrouter: openRouterProvider,

}

export const getProvider = (model: string) => {
    console.log('model', model);
    const providerName = model.split('::')[0];
    const provider = apiProviders[providerName as keyof typeof apiProviders];
    if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
    }

    return provider(model.split('::')[1]);
}

const websearch = getProvider('openrouter::perplexity/llama-3.1-sonar-large-128k-online');
const reasoning = getProvider('openrouter::minimax/minimax-01');
const hermes2Pro = getProvider('openrouter::nousresearch/hermes-2-pro-llama-3-8b');
const code = getProvider('openrouter::deepseek/deepseek-r1-distill-llama-70b');
const longContext = getProvider('openrouter::minimax/minimax-01');
const llama323b = getProvider('openrouter::meta-llama/llama-3.2-3b-instruct');
export const modelByCategory = {
    // fast: hermes2Pro,
    fast: llama323b,
    fast2: hermes2Pro,
    reasoning: reasoning,
    websearch: websearch,
    code: code,
    longContext: longContext,
}

export const modelCategories = Object.keys(modelByCategory);
export const defaultCategory = modelCategories[0];

export function getModelByCategory(category: keyof typeof modelByCategory) {
    return modelByCategory[category];
}


