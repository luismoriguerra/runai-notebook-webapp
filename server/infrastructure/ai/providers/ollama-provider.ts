import { createOllama } from 'ollama-ai-provider';

const ollama = createOllama({
    baseURL: 'http://localhost:11434/api',
});

const LLMName = 'ollama';

export const models = [
    'vanilj/Phi-4:latest',
    'qwen2.5-coder:32b',
    'qwen2.5:32b',
    'llama3.2:3b',
];

export const ollamaModels = models.map(model => `${LLMName}::${model}`);

export const ollamaProvider = (ollamaModelName: string) => ollama(ollamaModelName); 