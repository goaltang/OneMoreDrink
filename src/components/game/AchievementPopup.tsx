import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../engine/achievements';
import { RARITY_INFO } from '../../engine/achievements';

interface AchievementPopupProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    const rarity = achievement ? RARITY_INFO[achievement.rarity] : null;

    return (
        <AnimatePresence>
            {achievement && rarity && (
                <motion.div
                    className="achievement-popup"
                    style={{
                        background: rarity.bg,
                        borderColor: rarity.color,
                        boxShadow: `0 4px 25px ${rarity.color}33`,
                    }}
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-content">
                        <h4 style={{ color: rarity.color }}>
                            🏅 解锁成就：{achievement.name}
                        </h4>
                        <p style={{ color: 'var(--c-text)' }}>{achievement.description}</p>
                        <span style={{
                            fontSize: 'var(--fs-xs)',
                            color: rarity.color,
                            fontWeight: 600
                        }}>
                            ⭐ {rarity.label}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
