import { motion } from 'framer-motion';
import type { GameMode } from '../types';

interface ModeSelectPageProps {
    onSelect: (mode: string) => void;
}

const modes = [
    {
        id: 'quick' as GameMode,
        icon: '🍺',
        title: '快速模拟',
        description: '直接选酒开喝，实时查看酒精对身体的影响',
        badge: '',
        disabled: false,
    },
    {
        id: 'story' as GameMode,
        icon: '📖',
        title: '剧情模式',
        description: '沉浸式故事体验，在不同场景中做出选择',
        badge: 'NEW!',
        disabled: false,
    },
    {
        id: 'longterm' as GameMode,
        icon: '📊',
        title: '长期模拟',
        description: '模拟长期饮酒习惯对身体的累积影响',
        badge: '即将上线',
        disabled: true,
    },
];

export default function ModeSelectPage({ onSelect }: ModeSelectPageProps) {
    return (
        <div className="page">
            <motion.div
                className="mode-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>🎮 选择模式</h1>

                <div className="mode-cards">
                    {modes.map((mode, i) => (
                        <motion.button
                            key={mode.id}
                            className={`mode-card ${mode.disabled ? 'mode-card-disabled' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            onClick={() => !mode.disabled && onSelect(mode.id)}
                            disabled={mode.disabled}
                        >
                            <span className="mode-card-icon">{mode.icon}</span>
                            <div className="mode-card-content">
                                <h3>{mode.title}</h3>
                                <p>{mode.description}</p>
                            </div>
                            {mode.badge && (
                                <span className="mode-card-badge">{mode.badge}</span>
                            )}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
