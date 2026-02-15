import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_NODES, INITIAL_STATS, ENDINGS, type StoryStats } from '../engine/story';

interface StoryPageProps {
    onBack: () => void;
}

/** 场景氛围背景色 */
const moodGradients: Record<string, string> = {
    chill: 'linear-gradient(135deg, rgba(30,40,80,0.8), rgba(20,30,60,0.6))',
    exciting: 'linear-gradient(135deg, rgba(80,30,50,0.8), rgba(60,20,40,0.6))',
    tense: 'linear-gradient(135deg, rgba(60,20,20,0.8), rgba(40,15,15,0.6))',
    romantic: 'linear-gradient(135deg, rgba(60,30,70,0.8), rgba(40,20,50,0.6))',
    danger: 'linear-gradient(135deg, rgba(80,10,10,0.8), rgba(60,5,5,0.6))',
    funny: 'linear-gradient(135deg, rgba(70,60,20,0.8), rgba(50,40,15,0.6))',
    sad: 'linear-gradient(135deg, rgba(20,30,50,0.8), rgba(15,20,40,0.6))',
    warm: 'linear-gradient(135deg, rgba(60,50,20,0.8), rgba(40,35,15,0.6))',
};

const endingTierStyles: Record<string, { bg: string; border: string; glow: string }> = {
    normal: { bg: 'rgba(150,150,150,0.1)', border: 'rgba(150,150,150,0.3)', glow: 'none' },
    good: { bg: 'rgba(78,205,196,0.1)', border: 'rgba(78,205,196,0.4)', glow: '0 0 20px rgba(78,205,196,0.2)' },
    perfect: { bg: 'rgba(255,217,61,0.1)', border: 'rgba(255,217,61,0.4)', glow: '0 0 30px rgba(255,217,61,0.3)' },
    bad: { bg: 'rgba(211,47,47,0.1)', border: 'rgba(211,47,47,0.3)', glow: '0 0 20px rgba(211,47,47,0.15)' },
    hidden: { bg: 'rgba(156,39,176,0.1)', border: 'rgba(156,39,176,0.4)', glow: '0 0 25px rgba(156,39,176,0.25)' },
    warning: { bg: 'rgba(211,47,47,0.15)', border: 'rgba(211,47,47,0.5)', glow: '0 0 30px rgba(211,47,47,0.3)' },
};

export default function StoryPage({ onBack }: StoryPageProps) {
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [stats, setStats] = useState<StoryStats>(INITIAL_STATS);
    const [history, setHistory] = useState<string[]>([]);
    const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);

    const currentNode = STORY_NODES[currentNodeId] || STORY_NODES['start'];
    const isEnding = currentNode.choices.length === 0;
    const endingInfo = isEnding ? ENDINGS[currentNodeId] : null;
    const mood = currentNode.mood || 'chill';
    const blurAmount = Math.min(stats.bac * 30, 4); // 醉酒模糊效果

    const handleChoice = (choiceIndex: number) => {
        const choice = currentNode.choices[choiceIndex];
        if (choice.condition && !choice.condition(stats)) return;

        if (choice.effect) {
            const changes = choice.effect(stats);
            setStats(prev => ({ ...prev, ...changes }));
        }
        setHistory(prev => [...prev, currentNodeId]);
        setCurrentNodeId(choice.nextId);
        setHoveredChoice(null);
    };

    const handleRestart = () => {
        setCurrentNodeId('start');
        setStats(INITIAL_STATS);
        setHistory([]);
    };

    const tierStyle = endingInfo ? endingTierStyles[endingInfo.tier] || endingTierStyles.normal : null;

    return (
        <div
            className="page-scroll story-page"
            style={{
                filter: blurAmount > 0.5 ? `blur(${blurAmount * 0.15}px)` : 'none',
                transition: 'filter 0.5s ease',
            }}
        >
            {/* 场景头部 */}
            {currentNode.scene && (
                <motion.div
                    className="story-scene-header"
                    style={{ background: moodGradients[mood] }}
                    key={currentNode.scene}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <span className="story-scene-icon">{currentNode.sceneIcon || '📍'}</span>
                    <span className="story-scene-title">{currentNode.scene}</span>
                    <span className="story-step-count">第 {history.length + 1} 步</span>
                </motion.div>
            )}

            {/* Stats 面板 */}
            <div className="story-stats-bar card">
                <div className="stat-item">
                    <span>🍷</span>
                    <div className="stat-bar-mini">
                        <div className="stat-bar-fill" style={{
                            width: `${Math.min(stats.bac / 0.2 * 100, 100)}%`,
                            background: stats.bac >= 0.08 ? 'var(--c-organ-critical)' : stats.bac >= 0.05 ? 'var(--c-organ-moderate)' : 'var(--c-organ-normal)'
                        }} />
                    </div>
                    <span className="stat-value">{(stats.bac * 100).toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                    <span>💰</span>
                    <span className="stat-value" style={{ color: stats.money < 100 ? '#ff6b6b' : 'inherit' }}>¥{stats.money}</span>
                </div>
                <div className="stat-item">
                    <span>⚡</span>
                    <div className="stat-bar-mini">
                        <div className="stat-bar-fill" style={{
                            width: `${stats.energy}%`,
                            background: stats.energy > 60 ? 'var(--c-accent)' : stats.energy > 30 ? '#ffa726' : '#ff5252'
                        }} />
                    </div>
                    <span className="stat-value">{stats.energy}</span>
                </div>
                <div className="stat-item">
                    <span>🤝</span>
                    <span className="stat-value">{stats.social}</span>
                </div>
            </div>

            {/* 主内容 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNodeId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="story-content"
                >
                    {isEnding && endingInfo ? (
                        <div className="story-ending-card" style={{
                            background: tierStyle?.bg,
                            border: `2px solid ${tierStyle?.border}`,
                            boxShadow: tierStyle?.glow,
                        }}>
                            <motion.div
                                className="ending-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            >
                                {endingInfo.icon}
                            </motion.div>
                            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                {endingInfo.title}
                            </motion.h2>
                            <motion.p className="ending-story-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                {currentNode.text}
                            </motion.p>
                            <motion.p className="ending-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                {endingInfo.desc}
                            </motion.p>

                            {/* 结算面板 */}
                            <motion.div className="ending-stats-summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                <div className="ending-stat">
                                    <span className="ending-stat-icon">🍷</span>
                                    <span>最终BAC: {(stats.bac * 100).toFixed(1)}%</span>
                                </div>
                                <div className="ending-stat">
                                    <span className="ending-stat-icon">💰</span>
                                    <span>剩余: ¥{stats.money}</span>
                                </div>
                                <div className="ending-stat">
                                    <span className="ending-stat-icon">🤝</span>
                                    <span>社交值: {stats.social}</span>
                                </div>
                                <div className="ending-stat">
                                    <span className="ending-stat-icon">📖</span>
                                    <span>经历 {history.length} 个场景</span>
                                </div>
                            </motion.div>

                            <motion.div className="ending-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                                <button className="btn btn-primary" onClick={handleRestart}>🔄 再玩一次</button>
                                <button className="btn btn-ghost" onClick={onBack}>🏠 返回主菜单</button>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            {/* NPC 对话 */}
                            {currentNode.npc && (
                                <motion.div
                                    className="story-npc-bubble"
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="npc-avatar">{currentNode.npc.icon}</div>
                                    <div className="npc-content">
                                        <span className="npc-name">{currentNode.npc.name}</span>
                                        <p className="npc-dialogue">{currentNode.npc.dialogue}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* 旁白 */}
                            <div className="story-text-card card">
                                <p>{currentNode.text}</p>
                            </div>

                            {/* 选项 */}
                            <div className="story-choices">
                                {currentNode.choices.map((choice, idx) => {
                                    const disabled = choice.condition ? !choice.condition(stats) : false;
                                    return (
                                        <motion.button
                                            key={idx}
                                            className={`btn btn-choice ${disabled ? 'btn-choice-disabled' : ''}`}
                                            whileHover={disabled ? {} : { scale: 1.02, x: 5 }}
                                            whileTap={disabled ? {} : { scale: 0.98 }}
                                            onClick={() => !disabled && handleChoice(idx)}
                                            onMouseEnter={() => setHoveredChoice(idx)}
                                            onMouseLeave={() => setHoveredChoice(null)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: disabled ? 0.4 : 1, x: 0 }}
                                            transition={{ delay: idx * 0.08 + 0.2 }}
                                            disabled={disabled}
                                        >
                                            <span className="choice-text">{choice.text}</span>
                                            {choice.hint && hoveredChoice === idx && (
                                                <motion.span
                                                    className="choice-hint"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    {choice.hint}
                                                </motion.span>
                                            )}
                                            {disabled && <span className="choice-locked">🔒 条件不足</span>}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
