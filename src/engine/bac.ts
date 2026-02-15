// ============================================================
// BAC 计算引擎 — 基于 Widmark 公式
// ============================================================

import type { Gender } from '../types';

/**
 * 计算酒精摄入克数
 * @param volumeMl - 饮品容量 (ml)
 * @param alcoholPercent - 酒精度 (%)
 * @returns 酒精克数
 */
export function calculateAlcoholGrams(volumeMl: number, alcoholPercent: number): number {
  const ALCOHOL_DENSITY = 0.789; // g/ml
  return volumeMl * (alcoholPercent / 100) * ALCOHOL_DENSITY;
}

/**
 * 计算血液酒精浓度 (BAC)
 * Widmark 公式: BAC = (酒精g / (体重kg × r)) × 100
 * r: 体液分布系数 (男 0.68, 女 0.55)
 */
export function calculateBAC(
  totalAlcoholGrams: number,
  weightKg: number,
  gender: Gender,
  isEmptyStomach: boolean,
  elapsedHours: number = 0
): number {
  const r = gender === 'male' ? 0.68 : 0.55;

  let bac = (totalAlcoholGrams / (weightKg * r * 10)); // 转换为百分比

  // 空腹吸收更快（峰值更高）
  if (isEmptyStomach) {
    bac *= 1.3;
  }

  // 减去已代谢部分
  const metabolized = metabolismRate(0, gender) * elapsedHours;
  bac = Math.max(0, bac - metabolized);

  return Math.round(bac * 10000) / 10000; // 保留4位小数
}

/**
 * 酒精代谢速率 (BAC%/小时)
 * 平均 0.015%/小时，受年龄和性别影响
 */
export function metabolismRate(age: number, gender: Gender): number {
  let baseRate = 0.015;

  if (age > 50) baseRate *= 0.8;
  else if (age < 25) baseRate *= 1.1;

  if (gender === 'female') baseRate *= 0.85;

  return baseRate;
}

/**
 * 预测清醒时间（小时）
 */
export function timeToSober(currentBAC: number, age: number, gender: Gender): number {
  if (currentBAC <= 0) return 0;
  const rate = metabolismRate(age, gender);
  return Math.ceil((currentBAC / rate) * 10) / 10;
}

/**
 * 格式化清醒时间为小时和分钟
 */
export function formatSoberTime(hours: number): string {
  if (hours <= 0) return '已清醒';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分钟`;
}
