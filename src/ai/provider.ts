// ============================================================
// AI 供应商接口 — 适配器模式（预留架构）
// ============================================================

import { OpenAIProvider } from './openai-provider';
import type { AIMessage } from '../types';

export type AIProviderType = 'none' | 'openai';

/**
 * AI 供应商接口
 * 后续可实现 OpenAI / Claude / 通义千问 / 文心一言 / Ollama 等
 */
export interface AIProvider {
  name: string;
  type: AIProviderType;

  /** 发送消息并获取回复 */
  chat(messages: AIMessage[]): Promise<string>;

  /** 检查连接是否可用 */
  isAvailable(): Promise<boolean>;
}

/**
 * AI 功能场景
 */
export type AIFeature = 'drunk-talk' | 'organ-dialog' | 'health-advice' | 'story-branch';

/**
 * Prompt 模板
 */
export const PROMPT_TEMPLATES: Record<AIFeature, (params: Record<string, string>) => string> = {
  'drunk-talk': (params) => `
你是一个模拟醉酒说话方式的 AI。请将以下清醒时说的话转换成醉酒版本。
要求：
- 语序混乱但大意相同
- 重复关键词
- 加入语气词（哎呀、真的、你知道吗、我跟你说）
- 情绪更加外露
- 可能不小心吐露隐藏想法
- 醉酒程度（BAC）：${params.bac}

原话：${params.input}

请直接输出醉话版本，不要解释：`,

  'organ-dialog': (params) => `
生成器官之间的幽默拟人化对话。当前状态：
- 肝脏负荷：${params.liverLoad}%
- 大脑清醒度：${params.brainClarity}%  
- BAC：${params.bac}%

要求：幽默、可爱、有教育意义。生成3-5句器官之间的对话。
格式：[器官名]："对话内容"`,

  'health-advice': (params) => `
根据以下信息生成个性化的健康饮酒建议：
- 年龄：${params.age}岁
- 性别：${params.gender}
- 体重：${params.weight}kg
- 本次饮酒量：${params.totalAlcohol}g 酒精
- 最高BAC：${params.maxBac}%

请提供3-5条实用建议，语气友善但认真。`,

  'story-branch': (params) => `
你是一个互动故事生成器。场景：${params.scene}
用户选择了：${params.choice}
当前BAC：${params.bac}

请生成后续剧情（2-3段话）和2-3个新的选项。
格式：
[剧情描述]
选项1：...
选项2：...
选项3（可选）：...`,
};

/**
 * 获取当前配置的 AI 供应商类型
 */
export function getConfiguredProvider(): AIProviderType {
  return (import.meta.env.VITE_AI_PROVIDER as AIProviderType) || 'none';
}

/**
 * 创建 AI 供应商实例
 */
export function createProvider(): AIProvider {
  const type = getConfiguredProvider();
  
  if (type === 'openai') {
    return new OpenAIProvider();
  }
  
  return new MockAIProvider();
}

/**
 * 占位实现 — MVP 阶段不调用实际 AI
 * 后续实现具体供应商后替换
 */
export class MockAIProvider implements AIProvider {
  name = 'Mock AI';
  type: AIProviderType = 'none';

  async chat(_messages: AIMessage[]): Promise<string> {
    return '（AI 功能将在 Phase 2 上线，敬请期待！）';
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }
}
