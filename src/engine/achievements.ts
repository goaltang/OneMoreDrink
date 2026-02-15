

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalAlcohol: number;      // Total grams of alcohol consumed
  maxBAC: number;            // Max BAC reached
  drinksCount: number;       // Total number of drinks
  drinkTypes: Set<string>;   // Set of drink IDs consumed
  clickCount?: number;       // For interactive elements
}

export const RARITY_INFO: Record<AchievementRarity, { label: string; color: string; bg: string }> = {
  common:    { label: '普通', color: '#b0bec5', bg: 'rgba(176,190,197,0.15)' },
  rare:      { label: '稀有', color: '#4ecdc4', bg: 'rgba(78,205,196,0.15)' },
  epic:      { label: '史诗', color: '#ab47bc', bg: 'rgba(171,71,188,0.15)' },
  legendary: { label: '传说', color: '#ffd93d', bg: 'rgba(255,217,61,0.15)' },
  hidden:    { label: '隐藏', color: '#ff5252', bg: 'rgba(255,82,82,0.15)' },
};

export const ACHIEVEMENTS: Achievement[] = [
  // ⚪ 普通
  {
    id: 'first_drop',
    name: '初体验',
    description: '喝下第一口酒',
    icon: '🍺',
    rarity: 'common',
    condition: (stats) => stats.drinksCount >= 1
  },
  {
    id: 'tipsy',
    name: '微醺时刻',
    description: 'BAC 达到 0.05%',
    icon: '☺️',
    rarity: 'common',
    condition: (stats) => stats.maxBAC >= 0.05
  },
  {
    id: 'three_drinks',
    name: '三杯下肚',
    description: '喝了三杯酒',
    icon: '🍻',
    rarity: 'common',
    condition: (stats) => stats.drinksCount >= 3
  },
  // 🟢 稀有
  {
    id: 'mixing_master',
    name: '调酒大师',
    description: '尝试了 3 种不同的酒',
    icon: '🎨',
    rarity: 'rare',
    condition: (stats) => stats.drinkTypes.size >= 3
  },
  {
    id: 'iron_liver',
    name: '铁肝',
    description: '累计摄入超过 100g 酒精',
    icon: '🛡️',
    rarity: 'rare',
    condition: (stats) => stats.totalAlcohol >= 100
  },
  {
    id: 'responsible',
    name: '适可而止',
    description: '喝了5杯以上但 BAC 保持在 0.1% 以下',
    icon: '🛑',
    rarity: 'rare',
    condition: (stats) => stats.drinksCount >= 5 && stats.maxBAC < 0.1
  },
  {
    id: 'five_types',
    name: '品酒师',
    description: '尝试了 5 种不同的酒',
    icon: '🍷',
    rarity: 'rare',
    condition: (stats) => stats.drinkTypes.size >= 5
  },
  // 🟣 史诗
  {
    id: 'danger_zone',
    name: '危险边缘',
    description: 'BAC 超过 0.15%',
    icon: '🚨',
    rarity: 'epic',
    condition: (stats) => stats.maxBAC >= 0.15
  },
  {
    id: 'marathon',
    name: '马拉松饮酒',
    description: '一次喝了 10 杯以上',
    icon: '🏃',
    rarity: 'epic',
    condition: (stats) => stats.drinksCount >= 10
  },
  {
    id: 'all_types',
    name: '全系列收藏家',
    description: '尝试了所有种类的酒',
    icon: '📚',
    rarity: 'epic',
    condition: (stats) => stats.drinkTypes.size >= 8
  },
  {
    id: 'social_butterfly',
    name: '社交蝴蝶',
    description: '在保持低 BAC 的同时大量饮酒',
    icon: '🦋',
    rarity: 'epic',
    condition: (stats) => stats.drinksCount >= 8 && stats.maxBAC < 0.08
  },
  // 🟡 传说
  {
    id: 'sober_king',
    name: '理性之光',
    description: '喝了很多酒却始终保持清醒 (BAC < 0.05%)',
    icon: '👑',
    rarity: 'legendary',
    condition: (stats) => stats.drinksCount >= 6 && stats.maxBAC < 0.05
  },
  {
    id: 'heavy200',
    name: '钢铁之躯',
    description: '累计摄入超过 200g 酒精',
    icon: '⚔️',
    rarity: 'legendary',
    condition: (stats) => stats.totalAlcohol >= 200
  },
  // 🔴 隐藏
  {
    id: 'zero_drinks',
    name: '滴酒不沾',
    description: '进入饮酒页面但一杯都没喝就结束了',
    icon: '🧘',
    rarity: 'hidden',
    condition: (stats) => stats.drinksCount === 0
  },
  {
    id: 'one_shot',
    name: '一击致命',
    description: '第一杯酒就让 BAC 飙到 0.08% 以上',
    icon: '💥',
    rarity: 'hidden',
    condition: (stats) => stats.drinksCount === 1 && stats.maxBAC >= 0.08
  }
];

export function checkAchievements(
  currentStats: AchievementStats, 
  unlockedIds: string[]
): Achievement[] {
  const newUnlocked: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (!unlockedIds.includes(achievement.id)) {
      if (achievement.condition(currentStats)) {
        newUnlocked.push(achievement);
      }
    }
  });

  return newUnlocked;
}
