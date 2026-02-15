// ============================================================
// 器官状态评估引擎
// ============================================================

import type { OrganType, OrganStatus, OrganState } from '../types';

/** 各器官的 BAC 阈值 */
const ORGAN_THRESHOLDS: Record<OrganType, number[]> = {
  brain:   [0.02, 0.05, 0.08, 0.15],
  liver:   [0.03, 0.06, 0.10, 0.18],
  stomach: [0.02, 0.05, 0.09, 0.15],
  heart:   [0.04, 0.08, 0.13, 0.20],
  kidney:  [0.03, 0.07, 0.12, 0.18],
};

/** 器官元数据 */
const ORGAN_META: Record<OrganType, { icon: string; name: string }> = {
  brain:   { icon: '🧠', name: '大脑' },
  liver:   { icon: '🫀', name: '肝脏' },
  stomach: { icon: '🤢', name: '胃' },
  heart:   { icon: '❤️', name: '心脏' },
  kidney:  { icon: '💧', name: '肾脏' },
};

/** 器官不同状态下的拟人化台词 */
const ORGAN_QUOTES: Record<OrganType, Record<OrganStatus, string>> = {
  brain: {
    normal:   '状态良好，思维清晰~ 🎵',
    mild:     '嗯...感觉有点飘飘然，话好像变多了',
    moderate: '等等...我刚刚说了什么？反应有点慢了...',
    severe:   '系统提示：记忆储存失败！我...我在哪？',
    critical: '⚠️ 警告：意识系统即将关闭......',
  },
  liver: {
    normal:   '工作正常，轻松愉快~',
    mild:     '来活了来活了，开始加班分解酒精...',
    moderate: '老板！我申请加班费！真的顶不住了！',
    severe:   '🔥 我已经在冒烟了！求求别再喝了！！',
    critical: '💀 系统过载...脂肪开始堆积...我要罢工了...',
  },
  stomach: {
    normal:   '一切平稳，消化系统运转正常~',
    mild:     '嗯...有点刺激，还能撑住',
    moderate: '求求你吃点东西垫垫底... 🥺',
    severe:   '翻江倒海！！我要造反了！！🌊',
    critical: '💔 胃壁在求救...黏膜严重受损...',
  },
  heart: {
    normal:   '♪ 砰、砰、砰~ 节奏正常 ♪',
    mild:     '心跳加快了一点点...感觉有点兴奋',
    moderate: '砰砰砰砰！跳得好快！脸好红！',
    severe:   '⚡ 心率飙升！血管扩张！我快受不了了！',
    critical: '🚨 紧急！心跳严重不规律！',
  },
  kidney: {
    normal:   '过滤系统在线，一切OK~',
    mild:     '工作量开始增加了...频繁过滤中',
    moderate: '好累...利尿功能全开，水分在流失 💦',
    severe:   '😰 脱水警报！我拼命工作也来不及了！',
    critical: '⚠️ 过载！严重脱水风险！',
  },
};

/** 器官科普描述 */
const ORGAN_DESCRIPTIONS: Record<OrganType, Record<OrganStatus, string>> = {
  brain: {
    normal:   '大脑功能正常，判断力和协调性未受影响。',
    mild:     '酒精抑制了前额叶皮层，判断力开始下降，社交抑制减弱，你可能变得更"话多"。',
    moderate: '小脑受到影响，协调性和反应速度明显下降。危险行为的风险增加。',
    severe:   '海马体功能受损，可能出现"断片"（记忆空白）。你明天可能不记得今晚发生了什么。',
    critical: '大脑功能严重抑制，意识模糊，可能出现昏迷。呼吸中枢可能受影响，非常危险！',
  },
  liver: {
    normal:   '肝脏每小时可代谢约7-10克酒精（约一杯啤酒），目前游刃有余。',
    mild:     '肝脏开始努力工作，乙醇→乙醛→乙酸的代谢链正在加速运转。',
    moderate: '酒精代谢已超负荷。乙醛（致癌物）在体内积累，这就是你脸红的原因。',
    severe:   '肝脏严重超负荷！长期如此会导致脂肪肝。你的ALDH2酶可能不够用了。',
    critical: '持续的高负荷会导致肝细胞损伤。长期重度饮酒→脂肪肝→肝炎→肝硬化→肝癌。',
  },
  stomach: {
    normal:   '胃黏膜完好，消化系统正常运作。',
    mild:     '酒精开始刺激胃黏膜，胃酸分泌增加。',
    moderate: '胃黏膜受到明显刺激，可能出现烧心感。空腹饮酒时伤害更大。',
    severe:   '胃黏膜可能出现急性损伤，恶心感强烈。呕吐其实是身体的自我保护机制。',
    critical: '胃部严重不适，可能引发急性胃炎。长期如此会增加胃溃疡风险。',
  },
  heart: {
    normal:   '心率60-100次/分钟，血压正常。',
    mild:     '酒精使血管扩张，面部潮红。心率轻微加快。',
    moderate: '心率可能升至100-120次/分，血压波动。面部和颈部明显发红。',
    severe:   '心率可能超过120次/分。酒精性心肌病的风险增加。',
    critical: '心律可能变得不规则。长期重度饮酒是心肌病的重要诱因。',
  },
  kidney: {
    normal:   '肾脏正常过滤血液，维持体液平衡。',
    mild:     '酒精抑制抗利尿激素（ADH），排尿增加，轻度脱水开始。',
    moderate: '脱水加剧，这就是为什么喝酒后你会频繁上厕所。记得多喝水！',
    severe:   '严重脱水！这是明天宿醉头疼的主要原因之一。电解质流失。',
    critical: '肾脏负担极重，电解质严重失衡。长期如此会损伤肾功能。',
  },
};

/**
 * 评估器官状态
 */
export function getOrganStatus(bac: number, organ: OrganType): OrganStatus {
  const thresholds = ORGAN_THRESHOLDS[organ];
  if (bac < thresholds[0]) return 'normal';
  if (bac < thresholds[1]) return 'mild';
  if (bac < thresholds[2]) return 'moderate';
  if (bac < thresholds[3]) return 'severe';
  return 'critical';
}

/**
 * 获取器官完整状态信息
 */
export function getOrganState(bac: number, organ: OrganType): OrganState {
  const status = getOrganStatus(bac, organ);
  const meta = ORGAN_META[organ];

  // 健康百分比映射
  const healthMap: Record<OrganStatus, number> = {
    normal: 100,
    mild: 80,
    moderate: 55,
    severe: 30,
    critical: 10,
  };

  return {
    type: organ,
    status,
    healthPercent: healthMap[status],
    icon: meta.icon,
    name: meta.name,
    quote: ORGAN_QUOTES[organ][status],
    description: ORGAN_DESCRIPTIONS[organ][status],
  };
}

/**
 * 获取所有器官状态
 */
export function getAllOrganStates(bac: number): OrganState[] {
  const organs: OrganType[] = ['brain', 'liver', 'stomach', 'heart', 'kidney'];
  return organs.map(organ => getOrganState(bac, organ));
}
