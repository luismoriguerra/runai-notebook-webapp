import { openRouterModels, openRouterProvider } from "./providers/open-router";
import { perplexityProvider } from "./providers/perplexity";
import { perplexityModels } from "./providers/perplexity";

// https://sdk.vercel.ai/providers/ai-sdk-providers


export const models = [
    ...openRouterModels,
    ...perplexityModels,
]

export const apiProviders = {
    openrouter: openRouterProvider,
    perplexity: perplexityProvider,
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

export const phi4Model = getProvider('openrouter::microsoft/phi-4');  // Context 16k, output 16k
export const deepseekChatModel = getProvider('openrouter::deepseek/deepseek-chat'); // Context 64k, output 8k
export const deepseekR1Model = getProvider('openrouter::deepseek/deepseek-r1');
export const minimaxModel = getProvider('openrouter::minimax/minimax-01'); // Context 1M, output 1M
export const claude35SonnetModel = getProvider('openrouter::anthropic/claude-3.5-sonnet:beta');

export const modelsCategories = {
    fast: phi4Model,
    standard: deepseekChatModel,
    reasoning: deepseekR1Model,
    longContext: minimaxModel,
    code: claude35SonnetModel,
}

export const modelCategories = Object.keys(modelsCategories);

export function getModelByCategory(category: keyof typeof modelsCategories) {

    if (!modelsCategories[category]) {
        throw new Error(`Category ${category} not found`);
    }

    return modelsCategories[category];
}

export function getModelbyPromptSize(promptLength: number) {

    const tokenSize = promptLength / 4;

    if (tokenSize < 5000) {
        return phi4Model;
    }

    if (tokenSize < 32000) {
        return deepseekChatModel;
    }

    return minimaxModel;
}

