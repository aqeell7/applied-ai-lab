export interface ModelPricing {
  inputPrice: number;
  cacheInputPrice: number;
  outputPrice: number;
}

export type ModelName = 'gpt-5.6-sol' | 'gpt-5.4-mini' | 'gpt-5.4-nano' | 'gpt-5-nano';

export const API_RATES: Record<ModelName, ModelPricing> = {
  'gpt-5.6-sol': {
    inputPrice: 4.0,
    cacheInputPrice: 0.4,
    outputPrice: 20.0,
  },
  'gpt-5.4-mini': {
    inputPrice: 0.75,
    cacheInputPrice: 0.075,
    outputPrice: 4.5,
  },
  'gpt-5.4-nano': {
    inputPrice: 0.2,
    cacheInputPrice: 0.02,
    outputPrice: 1.25,
  },
  'gpt-5-nano': {
    inputPrice: 0.05,
    cacheInputPrice: 0.005,
    outputPrice: 0.4,
  },
};

export interface TextCostInput {
  model: ModelName;
  text: string;
  outputTokens: number;
  cachedTokens?: number;
}

export interface TokenCountCostInput{
  model: ModelName;
  inputTokens: number;
  outputTokens: number,
  cachedTokens?: number
}

export type costEstimateParams = TextCostInput | TokenCountCostInput;