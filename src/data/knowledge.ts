// ============================================================
// 科普知识库
// ============================================================

export interface KnowledgeItem {
  id: string;
  title: string;
  emoji: string;
  content: string;
  category: 'science' | 'myth' | 'health' | 'law';
}

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'aldh2',
    title: '为什么有人"一喝就上脸"？',
    emoji: '😳',
    category: 'science',
    content:
      '大约36%的东亚人携带 ALDH2 基因缺陷，导致乙醛脱氢酶活性降低。酒精在体内被分解为乙醛（有毒），然后再被 ALDH2 分解为无害的乙酸。基因缺陷者乙醛积累得更快，导致面部潮红、心跳加速、恶心等症状。这不是"酒量好"的表现，恰恰相反，这意味着你的身体更难处理酒精！',
  },
  {
    id: 'hangover',
    title: '宿醉为什么会头疼？',
    emoji: '🤕',
    category: 'science',
    content:
      '宿醉头疼的原因是多方面的：1) 脱水 — 酒精抑制抗利尿激素，导致大量排尿和脱水；2) 乙醛毒性 — 乙醛在体内积累引起炎症反应；3) 睡眠质量差 — 酒精虽然帮助入睡，但会严重干扰睡眠的REM阶段；4) 胃肠刺激 — 胃酸分泌增加，胃黏膜受损。最好的"解酒"方法：多喝水、补充电解质、吃清淡食物、充分休息。',
  },
  {
    id: 'hangover-cure',
    title: '解酒药真的有用吗？',
    emoji: '💊',
    category: 'myth',
    content:
      '市面上的"解酒药"大多缺乏科学证据。目前没有任何药物能够加速酒精代谢。一些产品含有维生素B族或氨基酸，可能轻微缓解宿醉症状，但不能真正"解酒"。蜂蜜水中的果糖也曾被认为能帮助代谢酒精，但效果微乎其微。唯一有效的方法就是：少喝或不喝。',
  },
  {
    id: 'blackout',
    title: '喝多了为什么会"断片"？',
    emoji: '🕳️',
    category: 'science',
    content:
      '"断片"（Blackout）是因为酒精严重干扰了大脑海马体的功能。海马体负责将短期记忆转化为长期记忆。高浓度酒精阻断了这一过程，所以你当时可能仍在说话、走路，但大脑无法记录这些事件。断片分两种：片段性（记忆不连续）和完全性（整段时间空白）。BAC 达到 0.15% 以上时断片风险急剧增加。',
  },
  {
    id: 'red-wine-health',
    title: '红酒真的养生吗？',
    emoji: '🍷',
    category: 'myth',
    content:
      '"每天一杯红酒有益健康"的说法已被多项最新研究质疑。红酒中的白藜芦醇确实有抗氧化作用，但含量极低，你需要喝几百瓶才能达到实验中的有效剂量。2023年《柳叶刀》研究明确指出：酒精没有"安全剂量"，任何饮酒量都会增加健康风险。如果你不喝酒，没有理由为了"养生"开始喝。',
  },
  {
    id: 'dui-standards',
    title: '各国酒驾标准对比',
    emoji: '🚗',
    category: 'law',
    content:
      '🇨🇳 中国：BAC ≥ 0.02% 饮酒驾车，≥ 0.08% 醉酒驾车（刑事犯罪）\n🇺🇸 美国：BAC ≥ 0.08%（部分州对21岁以下零容忍）\n🇯🇵 日本：BAC ≥ 0.03%（非常严格）\n🇩🇪 德国：BAC ≥ 0.05%\n🇸🇪 瑞典：BAC ≥ 0.02%（最严格之一）\n\n⚠️ 中国是世界上对酒驾处罚最严厉的国家之一，醉驾直接入刑。永远不要酒后开车！',
  },
  {
    id: 'metabolism-speed',
    title: '酒后多久能开车？',
    emoji: '⏱️',
    category: 'health',
    content:
      '人体平均每小时代谢约7-10克酒精（约等于一杯啤酒的酒精量）。以下是大致参考：\n• 1瓶啤酒(330ml)：约需2-3小时\n• 2杯红酒(300ml)：约需4-5小时\n• 3两白酒(150ml)：约需8-10小时\n\n⚠️ 个体差异很大！体重、性别、基因、是否空腹都会影响。保险起见：前一晚大量饮酒，第二天上午也不建议开车。',
  },
  {
    id: 'food-protection',
    title: '喝酒前吃什么能"护胃"？',
    emoji: '🍞',
    category: 'health',
    content:
      '虽然没有食物能完全保护胃不受酒精伤害，但以下方法可以减缓酒精吸收：\n\n✅ 推荐：牛奶/酸奶（在胃壁形成保护层）、面包/馒头（吸收部分酒精）、高蛋白食物（减缓胃排空）、坚果（含油脂减缓吸收）\n\n❌ 避免：空腹喝酒（吸收速度快30%）、碳酸饮料混酒（加速吸收）、高糖饮品（掩盖醉意但不减轻伤害）',
  },
];

/**
 * 获取与酒精浓度相关的知识
 */
export function getRelevantKnowledge(bac: number): KnowledgeItem[] {
  if (bac < 0.02) return knowledgeItems.filter(k => ['food-protection', 'red-wine-health'].includes(k.id));
  if (bac < 0.05) return knowledgeItems.filter(k => ['aldh2', 'metabolism-speed'].includes(k.id));
  if (bac < 0.08) return knowledgeItems.filter(k => ['dui-standards', 'hangover'].includes(k.id));
  return knowledgeItems.filter(k => ['blackout', 'hangover-cure', 'dui-standards'].includes(k.id));
}
