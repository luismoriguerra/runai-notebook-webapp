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

const llama3b = getProvider('openrouter::meta-llama/llama-3.2-3b-instruct'); // https://openrouter.ai/meta-llama/llama-3.2-3b-instruct
const hermes2Pro8b = getProvider('openrouter::nousresearch/hermes-2-pro-llama-3-8b'); // https://openrouter.ai/nousresearch/hermes-2-pro-llama-3-8b

const deepseekr1Distill70b = getProvider('openrouter::deepseek/deepseek-r1-distill-llama-70b');
const r1DistillQwen32b = getProvider('openrouter::deepseek/deepseek-r1-distill-qwen-32b');
const deepseekr1 = getProvider('openrouter::deepseek/deepseek-r1'); //https://openrouter.ai/deepseek/deepseek-r1
const o1mini = getProvider('openrouter::openai/o1-mini'); // https://openrouter.ai/openai/o1-mini

const minimax = getProvider('openrouter::minimax/minimax-01'); // https://openrouter.ai/minimax/minimax-01

const perplexitySonarLarge = getProvider('openrouter::perplexity/llama-3.1-sonar-large-128k-online'); // https://openrouter.ai/perplexity/llama-3.1-sonar-large-128k-online

export const modelByCategory = {
    // fastHermes2Pro8b: hermes2Pro8b,
    fastLlama3b: llama3b,

    deepseekr1Distill70b: deepseekr1Distill70b,
    reasoningR1Qwen32b: r1DistillQwen32b,
    reasoningMiniMax: minimax,

    codeR1Qwen32b: r1DistillQwen32b,
    codeR1: deepseekr1,
    codeo1mini: o1mini,

    longContext: minimax,
    websearch: perplexitySonarLarge,
}

export const modelCategories = Object.keys(modelByCategory);
export const defaultCategory = modelCategories[0];

export function getModelByCategory(category: keyof typeof modelByCategory) {
    return modelByCategory[category];
}


