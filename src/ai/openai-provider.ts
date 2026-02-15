import type { AIProvider, AIProviderType } from './provider';
import type { AIMessage } from '../types';

/**
 * OpenAI 兼容的 AI 供应商 (支持 DeepSeek, Moonshot 等)
 */
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI Compatible';
  type: AIProviderType = 'openai';

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY || '';
    this.baseURL = import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';
    this.model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('未配置 API Key');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API 请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }
}
