// ============================================================
// 酒品数据库
// ============================================================

import type { Drink } from '../types';

export const drinks: Drink[] = [
  {
    id: 'beer',
    name: '啤酒',
    nameEn: 'Beer',
    volume: 330,
    alcohol: 3.5,
    icon: '🍺',
    color: '#F5A623',
  },
  {
    id: 'red-wine',
    name: '红酒',
    nameEn: 'Red Wine',
    volume: 150,
    alcohol: 12,
    icon: '🍷',
    color: '#8B0000',
  },
  {
    id: 'baijiu',
    name: '白酒（二锅头）',
    nameEn: 'Baijiu',
    volume: 50,
    alcohol: 56,
    icon: '🥃',
    color: '#D4A574',
  },
  {
    id: 'whiskey',
    name: '威士忌',
    nameEn: 'Whiskey',
    volume: 40,
    alcohol: 40,
    icon: '🥃',
    color: '#B8860B',
  },
  {
    id: 'cocktail',
    name: '鸡尾酒',
    nameEn: 'Cocktail',
    volume: 200,
    alcohol: 15,
    icon: '🍹',
    color: '#FF69B4',
  },
  {
    id: 'long-island',
    name: 'Long Island',
    nameEn: 'Long Island Iced Tea',
    volume: 250,
    alcohol: 22,
    icon: '🍹',
    color: '#DAA520',
  },
  {
    id: 'sake',
    name: '清酒',
    nameEn: 'Sake',
    volume: 100,
    alcohol: 15,
    icon: '🍶',
    color: '#E8E8D0',
  },
  {
    id: 'vodka',
    name: '伏特加',
    nameEn: 'Vodka',
    volume: 40,
    alcohol: 40,
    icon: '🍸',
    color: '#C0C0C0',
  },
];
