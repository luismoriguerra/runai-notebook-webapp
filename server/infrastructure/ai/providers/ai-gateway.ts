const API_GATEWAY_NAME = 'resume-ai-api-gw';

export const getAIGatewayUrl = (providerName: string): string => {
    return `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${API_GATEWAY_NAME}/${providerName}`;
} 
