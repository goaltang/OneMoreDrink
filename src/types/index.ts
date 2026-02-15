// ============================================================
// 酒精模拟器 — 核心类型定义
// ============================================================

/** 性别 */
export type Gender = 'male' | 'female';

/** 酒量自评等级 */
export type AlcoholTolerance = 'low' | 'medium' | 'high';

/** 用户角色 */
export interface Character {
  gender: Gender;
  weight: number;       // kg (30-150)
  age: number;          // 18-80
  isEmptyStomach: boolean;
  tolerance: AlcoholTolerance;
  name: string;
}

/** 酒品定义 */
export interface Drink {
  id: string;
  name: string;
  nameEn: string;
  volume: number;       // ml
  alcohol: number;      // 酒精度 %
  icon: string;         // emoji
  color: string;        // 主题色
}

/** 饮酒记录 */
export interface DrinkRecord {
  drinkId: string;
  timestamp: number;    // ms since session start
  alcoholGrams: number;
}

/** BAC 等级 */
export type BACLevel = 'sober' | 'tipsy' | 'mild' | 'moderate' | 'heavy' | 'danger';

/** BAC 等级描述 */
export interface BACLevelInfo {
  level: BACLevel;
  label: string;
  labelEn: string;
  description: string;
  color: string;
  minBAC: number;
  maxBAC: number;
}

/** 器官类型 */
export type OrganType = 'brain' | 'liver' | 'stomach' | 'heart' | 'kidney';

/** 器官状态等级 */
export type OrganStatus = 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';

/** 器官状态 */
export interface OrganState {
  type: OrganType;
  status: OrganStatus;
  healthPercent: number;   // 0-100
  icon: string;
  name: string;
  quote: string;           // 器官拟人化台词
  description: string;     // 科普描述
}

/** 游戏模式 */
export type GameMode = 'quick' | 'story' | 'longterm';

/** 饮酒会话状态 */
export interface DrinkingSession {
  character: Character;
  records: DrinkRecord[];
  startTime: number;
  currentBAC: number;
  totalAlcoholGrams: number;
  elapsedMinutes: number;
}

/** 打地鼠游戏结果 */
export interface WhackAMoleResult {
  score: number;
  totalTargets: number;
  accuracy: number;
  averageReactionTime: number;
  bac: number;
}

/** AI 供应商类型 */
export type AIProviderType = 'openai' | 'claude' | 'qwen' | 'ernie' | 'ollama' | 'none';

/** AI 消息 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
