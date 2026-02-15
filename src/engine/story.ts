export interface StoryChoice {
  text: string;
  nextId: string;
  effect?: (stats: StoryStats) => Partial<StoryStats>;
  condition?: (stats: StoryStats) => boolean;
  hint?: string; // 悬浮提示，如 "🍺+1 💰-88"
}

export interface StoryNPC {
  name: string;
  icon: string;
  dialogue: string;
}

export type SceneMood = 'chill' | 'exciting' | 'tense' | 'romantic' | 'danger' | 'funny' | 'sad' | 'warm';

export interface StoryNode {
  id: string;
  text: string;
  choices: StoryChoice[];
  scene?: string;       // 场景标题
  sceneIcon?: string;    // 场景图标
  mood?: SceneMood;
  npc?: StoryNPC;
}

export interface StoryStats {
  bac: number;
  money: number;
  energy: number;
  social: number;       // 社交值
  inventory: string[];
}

export const INITIAL_STATS: StoryStats = {
  bac: 0,
  money: 500,
  energy: 100,
  social: 0,
  inventory: []
};

export const STORY_NODES: Record<string, StoryNode> = {
  // ========== 开场 ==========
  start: {
    id: 'start',
    scene: '十字街头',
    sceneIcon: '🌃',
    mood: 'chill',
    text: '今晚是你期待已久的周五夜。你站在繁华的十字街头，霓虹灯闪烁，晚风带着烧烤摊的香味。你打算去哪里开启这个夜晚？',
    choices: [
      { text: '🍺 去常去的那家精酿酒吧', nextId: 'craft_bar', effect: () => ({ money: -50 }), hint: '💰-50 打车费' },
      { text: '🏪 便利店买点酒，去江边吹风', nextId: 'riverside', effect: () => ({ money: -20 }), hint: '💰-20' },
      { text: '🏠 直接回家睡觉', nextId: 'home_early' }
    ]
  },

  // ========== 线路A：精酿酒吧 ==========
  craft_bar: {
    id: 'craft_bar',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'exciting',
    text: '酒吧里人声鼎沸，暖黄色的灯光透过精酿酒的琥珀色杯壁。你找了个角落坐下，酒保小王一眼认出了你。',
    npc: { name: '酒保小王', icon: '🧑‍🍳', dialogue: '"老样子？还是今天想试试新的？我们新到了一款僵尸鸡尾酒，劲挺大。"' },
    choices: [
      { text: '🍹 来杯"僵尸"鸡尾酒！', nextId: 'bar_zombie', effect: (s) => ({ bac: s.bac + 0.08, money: s.money - 88 }), hint: '🍺++ 💰-88' },
      { text: '🍺 先来杯淡啤酒', nextId: 'bar_beer', effect: (s) => ({ bac: s.bac + 0.03, money: s.money - 48 }), hint: '🍺+ 💰-48' },
      { text: '🥤 要杯无酒精的mocktail', nextId: 'bar_mocktail', effect: (s) => ({ money: s.money - 38 }), hint: '💰-38 不醉' }
    ]
  },

  bar_zombie: {
    id: 'bar_zombie',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'exciting',
    text: '这杯"僵尸"一入口就感觉火辣辣的，酒精瞬间冲上头顶。你感觉天旋地转，但心情异常兴奋！旁边一个女生好奇地看着你。',
    npc: { name: '邻座女生小美', icon: '👩', dialogue: '"哇，你真的敢喝僵尸啊？我之前喝了半杯就不行了。你怎么样？"' },
    choices: [
      { text: '💬 借着酒劲和她聊聊', nextId: 'bar_chat', effect: (s) => ({ energy: s.energy - 10, social: s.social + 20 }), hint: '⚡-10 🤝+20' },
      { text: '🤢 感觉不太对，去洗手间', nextId: 'bar_vomit', effect: (s) => ({ bac: Math.max(0, s.bac - 0.03), energy: s.energy - 30 }), hint: '🍺-少量 ⚡-30' },
      { text: '🍺 再来一杯！', nextId: 'bar_double', effect: (s) => ({ bac: s.bac + 0.06, money: s.money - 88, energy: s.energy - 15 }), hint: '🍺++ 💰-88 ⚡-15', condition: (s) => s.money >= 88 }
    ]
  },

  bar_beer: {
    id: 'bar_beer',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'chill',
    text: '冰镇啤酒入口柔顺，泡沫在嘴里散开。你悠闲地刷着手机，突然看到大学室友老李发的朋友圈——他竟然就在这家酒吧！',
    npc: { name: '室友老李', icon: '🧔', dialogue: '"卧槽兄弟！你也在这儿？过来过来一起喝！我这儿还有几个朋友！"' },
    choices: [
      { text: '🏃 过去和老李汇合', nextId: 'bar_reunion', effect: (s) => ({ social: s.social + 15 }), hint: '🤝+15' },
      { text: '📱 假装没看到，继续独饮', nextId: 'bar_alone', effect: (s) => ({ bac: s.bac + 0.02 }), hint: '🍺+' }
    ]
  },

  bar_mocktail: {
    id: 'bar_mocktail',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'chill',
    text: '这杯无酒精鸡尾酒清爽可口。酒保小王笑着说这是他的特调。音乐从爵士换成了流行歌，场子越来越热。',
    npc: { name: '酒保小王', icon: '🧑‍🍳', dialogue: '"不喝酒也能嗨啊！要不要试试我们的飞镖比赛？赢了的话今晚这杯free！"' },
    choices: [
      { text: '🎯 参加飞镖比赛', nextId: 'bar_darts', effect: (s) => ({ energy: s.energy - 10, social: s.social + 10 }), hint: '⚡-10 🤝+10' },
      { text: '🏠 喝完就走吧', nextId: 'END_SOBER_HERO' }
    ]
  },

  bar_chat: {
    id: 'bar_chat',
    scene: '精酿酒吧 · 角落',
    sceneIcon: '💬',
    mood: 'romantic',
    text: '你们聊了工作、旅行、最近看的电影。小美是个设计师，笑起来眼睛弯弯的。随着酒精作祟，你越说越多，连自己都觉得话太密了...',
    npc: { name: '小美', icon: '👩', dialogue: '"哈哈你说话好有趣！不过...你好像喝太多了？要不我帮你叫杯水？"' },
    choices: [
      { text: '💧 听她的，喝杯水醒醒', nextId: 'bar_sober_up', effect: (s) => ({ bac: Math.max(0, s.bac - 0.01), social: s.social + 10 }), hint: '🍺-少 🤝+10' },
      { text: '🍺 不不不，再来一轮！我请！', nextId: 'bar_overdrink', effect: (s) => ({ bac: s.bac + 0.07, money: s.money - 176, energy: s.energy - 20 }), hint: '🍺+++ 💰-176', condition: (s) => s.money >= 176 },
      { text: '📱 交换微信，见好就收', nextId: 'END_PERFECT_NIGHT', effect: (s) => ({ social: s.social + 30 }) }
    ]
  },

  bar_vomit: {
    id: 'bar_vomit',
    scene: '洗手间',
    sceneIcon: '🚻',
    mood: 'sad',
    text: '你冲进洗手间，胃里翻江倒海。吐完之后照镜子，脸色苍白，眼睛血丝满布。镜子里的你看起来很狼狈。',
    choices: [
      { text: '🚰 洗把脸，撑着回去', nextId: 'bar_return_weak', effect: (s) => ({ energy: s.energy - 10 }) },
      { text: '🚕 算了，叫车回家', nextId: 'END_HANGOVER' }
    ]
  },

  bar_double: {
    id: 'bar_double',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'danger',
    text: '第二杯僵尸下肚，你的视线开始模糊。整个酒吧好像在旋转。你尝试站起来，但腿一软又坐了回去。',
    npc: { name: '酒保小王', icon: '🧑‍🍳', dialogue: '"哥们儿，我看你差不多了，要不先歇会儿？我给你倒杯蜂蜜水。"' },
    choices: [
      { text: '💧 听劝，喝蜂蜜水', nextId: 'END_HANGOVER', effect: (s) => ({ bac: Math.max(0, s.bac - 0.02) }) },
      { text: '🚗 没事！我开车来的，走了！', nextId: 'END_DUI_WARNING' }
    ]
  },

  bar_reunion: {
    id: 'bar_reunion',
    scene: '精酿酒吧 · 大桌',
    sceneIcon: '🎉',
    mood: 'exciting',
    text: '老李拉你坐下，桌上已经有好几个人。大家热情地招呼你，骰子、纸牌、酒令齐上阵。气氛一下子high了起来！',
    npc: { name: '老李', icon: '🧔', dialogue: '"来来来！输了的喝一杯！你先来你先来！"' },
    choices: [
      { text: '🎲 加入喝酒游戏', nextId: 'bar_game', effect: (s) => ({ bac: s.bac + 0.05, energy: s.energy - 15, social: s.social + 25 }), hint: '🍺++ ⚡-15 🤝+25' },
      { text: '🙅 我就看看不参加', nextId: 'bar_spectate', effect: (s) => ({ social: s.social + 5 }), hint: '🤝+5 安全' },
      { text: '🍺 适度参与，控制量', nextId: 'bar_moderate', effect: (s) => ({ bac: s.bac + 0.02, social: s.social + 15 }), hint: '🍺+ 🤝+15' }
    ]
  },

  bar_alone: {
    id: 'bar_alone',
    scene: '精酿酒吧 · 角落',
    sceneIcon: '🍺',
    mood: 'sad',
    text: '你默默地喝着啤酒，看着酒吧里其他人的热闹。虽然有点孤独，但也挺自在的。手机上刷到一条新闻——今天是全球减少酒精危害日。',
    choices: [
      { text: '🤔 看完新闻，放下酒杯', nextId: 'END_SOBER_HERO' },
      { text: '🍺 管他呢，继续喝', nextId: 'bar_keep_drinking', effect: (s) => ({ bac: s.bac + 0.04, energy: s.energy - 10 }), hint: '🍺++ ⚡-10' }
    ]
  },

  bar_sober_up: {
    id: 'bar_sober_up',
    scene: '精酿酒吧',
    sceneIcon: '💧',
    mood: 'warm',
    text: '你喝了一大杯水，感觉清醒了不少。小美帮你倒了水，你们又聊了一会儿。夜色渐深，酒吧开始放慢歌了。',
    npc: { name: '小美', icon: '👩', dialogue: '"今晚挺开心的！下次有空一起吃个饭？我挺喜欢那家湘菜馆的。"' },
    choices: [
      { text: '😊 好啊！交换联系方式', nextId: 'END_PERFECT_NIGHT', effect: (s) => ({ social: s.social + 30 }) },
      { text: '👋 今晚到此为止吧', nextId: 'END_GOOD_NIGHT' }
    ]
  },

  bar_overdrink: {
    id: 'bar_overdrink',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'danger',
    text: '你请了两杯酒，越喝越嗨。但是你开始说胡话了，把前女友的事都说出来了。小美的表情从开心变成了尴尬...',
    npc: { name: '小美', icon: '👩', dialogue: '"那个...你喝太多了吧？我先走了，你自己注意安全。"' },
    choices: [
      { text: '😱 完了...社会性死亡', nextId: 'END_SOCIAL_DEATH' },
      { text: '🚕 算了，叫车回家反省', nextId: 'END_HANGOVER', effect: (s) => ({ money: s.money - 30 }) }
    ]
  },

  bar_return_weak: {
    id: 'bar_return_weak',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'sad',
    text: '你拖着虚弱的身体回到座位。酒保给你端了杯热茶。这个夜晚对你来说有点太长了。',
    choices: [
      { text: '🍵 喝完茶，见好就收', nextId: 'END_HANGOVER' },
      { text: '💪 没事！继续！', nextId: 'bar_keep_drinking', effect: (s) => ({ bac: s.bac + 0.04, energy: s.energy - 20 }) }
    ]
  },

  bar_game: {
    id: 'bar_game',
    scene: '精酿酒吧 · 喝酒游戏',
    sceneIcon: '🎲',
    mood: 'exciting',
    text: '你连输三局！每次输都要喝一杯。老李笑得前仰后合，桌上的人都在起哄。你已经分不清是5杯还是6杯了...',
    npc: { name: '老李', icon: '🧔', dialogue: '"哈哈哈兄弟你不行啊！怎么，大学的时候不是挺能喝的吗？"' },
    choices: [
      { text: '🙅 不行了不行了，我要退出', nextId: 'END_HANGOVER', effect: (s) => ({ bac: s.bac + 0.03 }) },
      { text: '🚗 头好晕...我得开车回去了', nextId: 'END_DUI_WARNING', condition: (s) => s.bac >= 0.05 },
      { text: '🚕 叫代驾回家吧', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ money: s.money - 60 }), hint: '💰-60 代驾费' }
    ]
  },

  bar_spectate: {
    id: 'bar_spectate',
    scene: '精酿酒吧',
    sceneIcon: '👀',
    mood: 'chill',
    text: '你在旁边看大家玩得不亦乐乎。虽然没喝多少，但气氛真好。老李突然想起什么，凑过来跟你说...',
    npc: { name: '老李', icon: '🧔', dialogue: '"对了！我下个月结婚，你必须来啊！到时候一定把你灌翻！"' },
    choices: [
      { text: '🎉 恭喜恭喜！一定到！', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ social: s.social + 20 }) },
      { text: '🍺 为你结婚干一杯！', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ bac: s.bac + 0.03, social: s.social + 25 }) }
    ]
  },

  bar_moderate: {
    id: 'bar_moderate',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'warm',
    text: '你适度参与，赢了几轮也输了几轮，但一直在控制自己的量。每次该你喝的时候只喝一小口。老李注意到了你的节制。',
    npc: { name: '老李', icon: '🧔', dialogue: '"你现在成熟多了啊！不像以前那样闷头灌了。这才是喝酒的正确姿势。"' },
    choices: [
      { text: '😊 差不多了，愉快地告别', nextId: 'END_PERFECT_NIGHT', effect: (s) => ({ social: s.social + 25 }) }
    ]
  },

  bar_darts: {
    id: 'bar_darts',
    scene: '精酿酒吧 · 飞镖区',
    sceneIcon: '🎯',
    mood: 'exciting',
    text: '你参加了飞镖比赛！因为没喝酒，手特别稳。三镖两中靶心！围观的人都在鼓掌！',
    choices: [
      { text: '🏆 赢了！免单走人', nextId: 'END_SOBER_HERO', effect: (s) => ({ money: s.money + 38, social: s.social + 15 }) }
    ]
  },

  bar_keep_drinking: {
    id: 'bar_keep_drinking',
    scene: '精酿酒吧',
    sceneIcon: '🍻',
    mood: 'danger',
    text: '你一杯接一杯。酒保的脸在你眼中变成了三个。你试图站起来，世界在旋转。手机屏幕上的字已经看不清了。',
    choices: [
      { text: '🚕 叫车回家', nextId: 'END_HANGOVER', effect: (s) => ({ money: s.money - 40 }) },
      { text: '🚗 自己开车', nextId: 'END_DUI_WARNING' }
    ]
  },

  // ========== 线路B：江边 ==========
  riverside: {
    id: 'riverside',
    scene: '江边',
    sceneIcon: '🌉',
    mood: 'chill',
    text: '江风微凉，远处的城市灯光倒映在水面上，波光粼粼。你坐在长椅上打开一罐冰啤酒，"噗嗤"一声清脆悦耳。旁边有一只橘猫在看着你。',
    choices: [
      { text: '🐱 和猫咪分享零食', nextId: 'feed_cat', effect: (s) => ({ money: s.money - 10, social: s.social + 5 }), hint: '💰-10 🐱友好度+' },
      { text: '🍺 自己独饮，享受孤独', nextId: 'drink_alone', effect: (s) => ({ bac: s.bac + 0.04, energy: s.energy + 10 }), hint: '🍺+ ⚡+10' },
      { text: '📞 打电话给老朋友', nextId: 'riverside_call', effect: (s) => ({ social: s.social + 10 }) }
    ]
  },

  feed_cat: {
    id: 'feed_cat',
    scene: '江边 · 与猫',
    sceneIcon: '🐱',
    mood: 'warm',
    text: '你拿出背包里的小零食递给橘猫。它犹豫了一下，小心翼翼地凑过来拿走了。然后居然主动蹭了蹭你的腿！它好像挺饿的...',
    npc: { name: '橘猫大福', icon: '🐱', dialogue: '"喵~喵喵~"（翻译：这个人类不错，加入我的铲屎官候选名单）' },
    choices: [
      { text: '🏪 去便利店买猫粮', nextId: 'buy_cat_food', effect: (s) => ({ money: s.money - 30 }), hint: '💰-30 🐱友好度++' },
      { text: '📸 给猫拍照发朋友圈', nextId: 'cat_photo', effect: (s) => ({ social: s.social + 5 }) },
      { text: '🍺 陪猫坐着喝啤酒', nextId: 'drink_with_cat', effect: (s) => ({ bac: s.bac + 0.03, energy: s.energy + 5 }) }
    ]
  },

  buy_cat_food: {
    id: 'buy_cat_food',
    scene: '便利店 → 江边',
    sceneIcon: '🏪',
    mood: 'warm',
    text: '你跑去便利店买了猫粮和一瓶矿泉水回来。大福已经在原地等你了！看到猫粮瞬间两眼放光，吃得呼噜呼噜的。你突然觉得比喝酒开心多了。',
    npc: { name: '大福', icon: '🐱', dialogue: '"呼噜呼噜...喵！"（翻译：正式任命你为首席铲屎官）' },
    choices: [
      { text: '🐱 带大福回家！', nextId: 'END_CAT_FRIEND' },
      { text: '👋 摸摸头说再见，明天再来', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ social: s.social + 10 }) }
    ]
  },

  cat_photo: {
    id: 'cat_photo',
    scene: '江边',
    sceneIcon: '📸',
    mood: 'warm',
    text: '你给大福拍了几张超可爱的照片发了朋友圈。很快就收到了一堆点赞和评论。有人问你"在哪里啊？我也要去看猫！"你感觉这个夜晚因为一只猫变得温暖了。',
    choices: [
      { text: '🐱 继续陪猫玩', nextId: 'drink_with_cat', effect: (s) => ({ bac: s.bac + 0.02 }) },
      { text: '🏠 心满意足地回家', nextId: 'END_GOOD_NIGHT' }
    ]
  },

  drink_with_cat: {
    id: 'drink_with_cat',
    scene: '江边 · 月下',
    sceneIcon: '🌙',
    mood: 'chill',
    text: '你靠在长椅上，大福缩成一团趴在你旁边。啤酒、江风、猫咪、远处的城市灯火——这一刻非常宁静。手机震了一下，是妈妈发来的消息："早点回家。"',
    choices: [
      { text: '💌 回复妈妈，带猫回家', nextId: 'END_CAT_FRIEND' },
      { text: '🌃 再坐一会儿', nextId: 'END_GOOD_NIGHT' }
    ]
  },

  drink_alone: {
    id: 'drink_alone',
    scene: '江边',
    sceneIcon: '🌃',
    mood: 'sad',
    text: '你独自喝着啤酒，看着江面上的灯光。脑海里浮现出很多回忆——毕业、工作、那个没说出口的表白。第一罐已经喝完了，手里还有一罐。',
    choices: [
      { text: '🍺 打开第二罐', nextId: 'riverside_tipsy', effect: (s) => ({ bac: s.bac + 0.04, energy: s.energy - 5 }), hint: '🍺+' },
      { text: '🏠 一罐就够了，回家吧', nextId: 'END_GOOD_NIGHT' },
      { text: '🐱 回头看看那只猫', nextId: 'feed_cat' }
    ]
  },

  riverside_call: {
    id: 'riverside_call',
    scene: '江边 · 电话中',
    sceneIcon: '📞',
    mood: 'warm',
    text: '你拨给了很久没联系的老同学小陈。电话接通的那一刻，你们像回到了大学时代，聊得停不下来。',
    npc: { name: '老同学小陈', icon: '📱', dialogue: '"好久不见啊！你最近怎么样？有空来我这边玩，带你吃好吃的！"' },
    choices: [
      { text: '😄 聊了很久，心情变好', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ social: s.social + 25, energy: s.energy + 10 }) },
      { text: '🍺 边聊天边喝酒', nextId: 'riverside_tipsy', effect: (s) => ({ bac: s.bac + 0.03, social: s.social + 20 }) }
    ]
  },

  riverside_tipsy: {
    id: 'riverside_tipsy',
    scene: '江边',
    sceneIcon: '🌃',
    mood: 'funny',
    text: '微醺的感觉刚刚好。江风吹在脸上特别舒服，你开始哼起歌来。远处有个遛狗的人看了你一眼，估计觉得你是个快乐的醉汉。',
    choices: [
      { text: '🎤 继续唱！管他呢！', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ energy: s.energy + 5 }) },
      { text: '🚕 差不多了，叫车回家', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ money: s.money - 25 }) },
      { text: '🍺 再开一罐！', nextId: 'riverside_drunk', effect: (s) => ({ bac: s.bac + 0.05, energy: s.energy - 15 }), hint: '🍺++ ⚡-15' }
    ]
  },

  riverside_drunk: {
    id: 'riverside_drunk',
    scene: '江边',
    sceneIcon: '🌃',
    mood: 'danger',
    text: '三罐啤酒下肚，你已经有点站不稳了。手机掉在了地上，拣起来发现屏幕裂了一条缝。该回家了...',
    choices: [
      { text: '🚕 叫代驾', nextId: 'END_HANGOVER', effect: (s) => ({ money: s.money - 40 }) },
      { text: '🚶 走路回家', nextId: 'END_HANGOVER', effect: (s) => ({ energy: s.energy - 30 }) }
    ]
  },

  // ========== 线路C：回家 ==========
  home_early: {
    id: 'home_early',
    scene: '回家路上',
    sceneIcon: '🏠',
    mood: 'chill',
    text: '你决定回家。走在回家的路上，经过那家24小时便利店，暖黄色的灯光从窗户里透出来。',
    choices: [
      { text: '🏪 进去买个夜宵', nextId: 'convenience_store', effect: (s) => ({ money: s.money - 15 }) },
      { text: '🏠 直接回家躺着', nextId: 'END_BORING' }
    ]
  },

  convenience_store: {
    id: 'convenience_store',
    scene: '24小时便利店',
    sceneIcon: '🏪',
    mood: 'warm',
    text: '便利店很安静，背景音乐放着老歌。货架上五颜六色的商品让你有种莫名的安心感。你买了关东煮，坐在窗边的位置上吃。',
    npc: { name: '便利店员小林', icon: '🧑‍💼', dialogue: '"一个人啊？这么晚还没回家。今天的关东煮很新鲜，萝卜特别好吃。"' },
    choices: [
      { text: '🍢 边吃边聊天', nextId: 'END_GOOD_NIGHT', effect: (s) => ({ social: s.social + 10, energy: s.energy + 10 }) },
      { text: '🍺 要不还是买瓶酒？', nextId: 'riverside', effect: (s) => ({ money: s.money - 8 }), hint: '💰-8 剧情转向江边' }
    ]
  },

  // ========== 结局节点 ==========
  END_BORING: {
    id: 'END_BORING',
    scene: '你的卧室',
    sceneIcon: '🛏️',
    mood: 'chill',
    text: '你回到家，躺在床上刷手机。虽然省了钱也没喝酒，但总觉得少了点什么。明天又是新的一天——不过今晚确实很健康。',
    choices: []
  },
  END_GOOD_NIGHT: {
    id: 'END_GOOD_NIGHT',
    scene: '夜幕落下',
    sceneIcon: '🌙',
    mood: 'warm',
    text: '你安全到家，洗了个热水澡，躺在床上回味今晚的一切。虽然喝了点酒，但量控制得不错。手机上多了几条新消息，今晚交到了新朋友。',
    choices: []
  },
  END_PERFECT_NIGHT: {
    id: 'END_PERFECT_NIGHT',
    scene: '完美夜晚',
    sceneIcon: '✨',
    mood: 'romantic',
    text: '这是一个近乎完美的夜晚。适量的酒精、有趣的对话、恰到好处的社交。你躺在床上，嘴角带着笑意渐渐入睡。手机里多了一个期待再见的人。',
    choices: []
  },
  END_HANGOVER: {
    id: 'END_HANGOVER',
    scene: '第二天早上',
    sceneIcon: '🤮',
    mood: 'sad',
    text: '阳光刺眼，头痛欲裂。你发誓再也不喝了——虽然这句话你上周也说过。桌上有一杯昨晚给自己倒的水，现在终于想起来喝了。翻看手机，昨晚发的朋友圈太尴尬了...',
    choices: []
  },
  END_SOCIAL_DEATH: {
    id: 'END_SOCIAL_DEATH',
    scene: '社会性死亡',
    sceneIcon: '💀',
    mood: 'funny',
    text: '第二天醒来，你翻看昨晚的聊天记录——天哪，你都说了什么？！给小美发了十二条语音，还发了大学时代的非主流照片。她已读不回。你决定注销这个微信号。',
    choices: []
  },
  END_DUI_WARNING: {
    id: 'END_DUI_WARNING',
    scene: '🚨 酒驾警告',
    sceneIcon: '🚔',
    mood: 'danger',
    text: '你摇摇晃晃地走向停车场。刚发动车子，就看到路口有交警在设卡查酒驾。你的BAC远超法定标准。这不是游戏，这是犯罪。\n\n⚠️ 酒后驾车 = 犯罪 + 危险！每年因酒驾导致的交通事故超过20万起。请永远不要酒后驾车！',
    choices: []
  },
  END_SOBER_HERO: {
    id: 'END_SOBER_HERO',
    scene: '清醒英雄',
    sceneIcon: '🏆',
    mood: 'warm',
    text: '今晚你几乎没喝酒，但玩得一点都不少！你证明了一件事——快乐不需要酒精。你的肝脏给你写了一封感谢信（虽然你看不到）。',
    choices: []
  },
  END_CAT_FRIEND: {
    id: 'END_CAT_FRIEND',
    scene: '温馨的家',
    sceneIcon: '🐱',
    mood: 'warm',
    text: '你带着大福回到了家。这只橘猫在你的沙发上转了三圈，然后缩成一团呼噜呼噜地睡着了。你给它拍了张照片设成了壁纸。从今以后，周五夜不再孤单。',
    choices: []
  }
};

export const ENDINGS: Record<string, { title: string; desc: string; icon: string; tier: 'normal' | 'good' | 'perfect' | 'bad' | 'hidden' | 'warning' }> = {
  END_BORING: {
    title: '宅男/宅女',
    desc: '你选择了一个极其健康的夜晚。肝脏感谢你，钱包也感谢你。',
    icon: '🏠',
    tier: 'normal'
  },
  END_GOOD_NIGHT: {
    title: '美好的夜晚',
    desc: '适度饮酒，量力而行。这才是成年人的浪漫。',
    icon: '🌙',
    tier: 'good'
  },
  END_PERFECT_NIGHT: {
    title: '酒神之夜',
    desc: '完美的社交、完美的酒量、完美的遇见。这样的夜晚值得被记住。',
    icon: '✨',
    tier: 'perfect'
  },
  END_HANGOVER: {
    title: '宿醉反省',
    desc: '头痛、恶心、后悔。酒精的惩罚来得总是很快。',
    icon: '🤮',
    tier: 'bad'
  },
  END_SOCIAL_DEATH: {
    title: '社死现场',
    desc: '酒后失言是最可怕的事情之一。酒精会摧毁你的判断力和社死防线。',
    icon: '💀',
    tier: 'bad'
  },
  END_DUI_WARNING: {
    title: '⚠️ 酒驾是犯罪',
    desc: '酒后驾车害人害己。记住：喝酒不开车，开车不喝酒。',
    icon: '🚔',
    tier: 'warning'
  },
  END_SOBER_HERO: {
    title: '清醒英雄',
    desc: '不喝酒也能嗨！你是当之无愧的自律达人。',
    icon: '🏆',
    tier: 'perfect'
  },
  END_CAT_FRIEND: {
    title: '猫咪挚友',
    desc: '你收获了比醉酒更珍贵的东西——一个毛茸茸的朋友。',
    icon: '🐱',
    tier: 'hidden'
  }
};
