import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character, DrinkRecord, OrganState } from '../types';
import { drinks } from '../data/drinks';
import { calculateAlcoholGrams, calculateBAC, timeToSober, formatSoberTime } from '../engine/bac';
import { getAllOrganStates } from '../engine/organs';
import DrunkTalkModal from '../components/ai/DrunkTalkModal';
import OrganChat from '../components/ai/OrganChat';

interface DrinkingPageProps {
    character: Character;
    onFinish: (records: DrinkRecord[], maxBAC: number) => void;
    onPlayGame: (bac: number) => void;
    onUpdate?: (records: DrinkRecord[], maxBAC: number) => void;
}

/** BAC 等级信息 */
function getBACInfo(bac: number) {
    if (bac < 0.02) return { label: '清醒', color: 'var(--c-organ-normal)', emoji: '😊' };
    if (bac < 0.05) return { label: '微醺', color: 'var(--c-organ-mild)', emoji: '😄' };
    if (bac < 0.08) return { label: '轻度醉酒', color: 'var(--c-organ-moderate)', emoji: '😵‍💫' };
    if (bac < 0.15) return { label: '重度醉酒 ⚠️', color: 'var(--c-organ-severe)', emoji: '🥴' };
    return { label: '⚠️ 危险！', color: 'var(--c-organ-critical)', emoji: '🚨' };
}

/** 状态标签 */
const statusLabels: Record<string, string> = {
    normal: '正常',
    mild: '轻微',
    moderate: '中度',
    severe: '严重',
    critical: '危险',
};

export default function DrinkingPage({ character, onFinish, onPlayGame, onUpdate }: DrinkingPageProps) {
    const [records, setRecords] = useState<DrinkRecord[]>([]);
    const [selectedOrgan, setSelectedOrgan] = useState<OrganState | null>(null);
    const [showDrunkTalk, setShowDrunkTalk] = useState(false);
    const [maxBAC, setMaxBAC] = useState(0);

    // Calculate current BAC
    const totalAlcohol = useMemo(
        () => records.reduce((sum, r) => sum + r.alcoholGrams, 0),
        [records]
    );

    const currentBAC = useMemo(
        () => calculateBAC(totalAlcohol, character.weight, character.gender, character.isEmptyStomach),
        [totalAlcohol, character]
    );

    // Trigger update for parent (Achievements)
    useEffect(() => {
        if (onUpdate) {
            onUpdate(records, maxBAC);
        }
    }, [records, maxBAC, onUpdate]);


    const bacInfo = getBACInfo(currentBAC);
    const soberTime = timeToSober(currentBAC, character.age, character.gender);
    const organStates = useMemo(() => getAllOrganStates(currentBAC), [currentBAC]);

    // Count drinks by type
    const drinkCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        records.forEach((r) => {
            counts[r.drinkId] = (counts[r.drinkId] || 0) + 1;
        });
        return counts;
    }, [records]);

    // Handle drinking
    const handleDrink = useCallback((drinkId: string) => {
        const drink = drinks.find((d) => d.id === drinkId);
        if (!drink) return;

        const alcoholGrams = calculateAlcoholGrams(drink.volume, drink.alcohol);
        const newRecord: DrinkRecord = {
            drinkId,
            timestamp: Date.now(),
            alcoholGrams,
        };

        setRecords((prev) => [...prev, newRecord]);

        // Update max BAC
        const newTotal = totalAlcohol + alcoholGrams;
        const newBAC = calculateBAC(newTotal, character.weight, character.gender, character.isEmptyStomach);
        if (newBAC > maxBAC) {
            setMaxBAC(newBAC);
        }
    }, [totalAlcohol, character, maxBAC]);

    // Handle removing drink
    const handleRemoveDrink = useCallback((index: number) => {
        const newRecords = [...records];
        newRecords.splice(index, 1);
        setRecords(newRecords);

        // Recalculate maxBAC (reset to current since removal implies correction)
        const newTotal = newRecords.reduce((sum, r) => sum + r.alcoholGrams, 0);
        const newBAC = calculateBAC(newTotal, character.weight, character.gender, character.isEmptyStomach);
        setMaxBAC(newBAC);
    }, [records, character]);

    // BAC progress bar width (capped at 0.3% for display)
    const bacPercent = Math.min((currentBAC / 0.3) * 100, 100);

    return (
        <div className="page-scroll">
            <div className="drinking-page">
                {/* Header */}
                <div className="drinking-header">
                    <div className="drinking-header-info">
                        <h2>{bacInfo.emoji} {character.name}（{character.weight}kg {character.gender === 'male' ? '男' : '女'}性 {character.isEmptyStomach ? '空腹' : '已进食'}）</h2>
                        <p>已摄入 {totalAlcohol.toFixed(1)}g 酒精 · 预计清醒：{formatSoberTime(soberTime)}</p>
                    </div>
                    <div className="drinking-header-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setShowDrunkTalk(true)}>
                            🥴 酒后真言
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => onPlayGame(currentBAC)}>
                            🎮 测反应
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => onFinish(records, maxBAC)}>
                            📊 结束
                        </button>
                    </div>
                </div>

                <DrunkTalkModal
                    isOpen={showDrunkTalk}
                    onClose={() => setShowDrunkTalk(false)}
                    bac={currentBAC}
                />

                <OrganChat bac={currentBAC} organs={organStates} />

                {/* BAC Display */}
                <motion.div className="bac-display card" layout>
                    <motion.div
                        className="bac-number"
                        style={{ color: bacInfo.color }}
                        key={currentBAC}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {(currentBAC * 100).toFixed(2)}%
                    </motion.div>
                    <div className="bac-label">血液酒精浓度（BAC）</div>
                    <div className="bac-status" style={{ color: bacInfo.color }}>
                        {bacInfo.label}
                    </div>

                    {/* Progress bar */}
                    <div className="bac-bar-container">
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                style={{ background: bacInfo.color }}
                                animate={{ width: `${bacPercent}%` }}
                                transition={{ type: 'spring', stiffness: 100 }}
                            />
                        </div>
                        {/* Markers */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: 'var(--fs-xs)', color: 'var(--c-text-dim)' }}>
                            <span>清醒</span>
                            <span style={{ position: 'relative', left: '-15%' }}>0.08% 醉驾线</span>
                            <span>0.3%+</span>
                        </div>
                    </div>

                    {/* Meta stats */}
                    <div className="bac-meta">
                        <div className="bac-meta-item">
                            <span className="bac-meta-value">{records.length}</span>
                            <span className="bac-meta-label">杯</span>
                        </div>
                        <div className="bac-meta-item">
                            <span className="bac-meta-value">{totalAlcohol.toFixed(1)}g</span>
                            <span className="bac-meta-label">酒精</span>
                        </div>
                        <div className="bac-meta-item">
                            <span className="bac-meta-value">{formatSoberTime(soberTime)}</span>
                            <span className="bac-meta-label">清醒倒计时</span>
                        </div>
                    </div>
                </motion.div>

                {/* DUI Warning */}
                <AnimatePresence>
                    {currentBAC >= 0.02 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                padding: 'var(--sp-md) var(--sp-lg)',
                                background: currentBAC >= 0.08 ? 'rgba(211, 47, 47, 0.15)' : 'rgba(255, 217, 61, 0.15)',
                                border: `1px solid ${currentBAC >= 0.08 ? 'rgba(211, 47, 47, 0.3)' : 'rgba(255, 217, 61, 0.3)'}`,
                                borderRadius: 'var(--r-md)',
                                marginBottom: 'var(--sp-lg)',
                                fontSize: 'var(--fs-sm)',
                                color: currentBAC >= 0.08 ? 'var(--c-organ-critical)' : 'var(--c-organ-mild)',
                            }}
                        >
                            {currentBAC >= 0.08
                                ? '🚨 你已达到法定醉驾标准（BAC ≥ 0.08%）！现在开车 = 犯罪 + 危险！'
                                : '⚠️ 你已达到饮酒驾车标准（BAC ≥ 0.02%）。请勿酒后驾车！'}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drink History */}
                <div className="drink-history">
                    <span className="drink-history-label">已喝：</span>
                    <div className="drink-history-icons">
                        <AnimatePresence mode="popLayout">
                            {records.length === 0 && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ color: 'var(--c-text-dim)' }}
                                >
                                    还没开始喝呢~
                                </motion.span>
                            )}
                            {records.map((r, i) => {
                                const drink = drinks.find((d) => d.id === r.drinkId);
                                return (
                                    <motion.span
                                        key={`${r.drinkId}-${r.timestamp}`}
                                        className="drink-history-icon"
                                        initial={{ scale: 0, rotate: -30 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                        onClick={() => handleRemoveDrink(i)}
                                        style={{ cursor: 'pointer' }}
                                        title={`点击移除 ${drink?.name}`}
                                    >
                                        {drink?.icon}
                                    </motion.span>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Drink Selection */}
                <h3 className="section-title">🍻 选择你的酒</h3>
                <div className="drinks-grid">
                    {drinks.map((drink) => (
                        <motion.button
                            key={drink.id}
                            className="drink-card"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95, rotate: -5 }}
                            onClick={() => handleDrink(drink.id)}
                        >
                            <span className="drink-card-icon">{drink.icon}</span>
                            <span className="drink-card-name">{drink.name}</span>
                            <span className="drink-card-info">{drink.volume}ml · {drink.alcohol}%</span>
                            {drinkCounts[drink.id] && (
                                <motion.span
                                    className="drink-count"
                                    key={drinkCounts[drink.id]}
                                    initial={{ scale: 1.5 }}
                                    animate={{ scale: 1 }}
                                >
                                    ×{drinkCounts[drink.id]}
                                </motion.span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Organs */}
                <h3 className="section-title">🫀 器官状态</h3>
                <div className="organs-grid">
                    {organStates.map((organ) => (
                        <motion.div
                            key={organ.type}
                            className={`organ-card border-${organ.status}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedOrgan(organ)}
                            layout
                        >
                            <div className="organ-card-header">
                                <span className="organ-card-icon">{organ.icon}</span>
                                <span className="organ-card-name">{organ.name}</span>
                                <span className={`organ-card-status status-${organ.status}`}>
                                    {statusLabels[organ.status]}
                                </span>
                            </div>
                            <p className="organ-card-quote">"{organ.quote}"</p>
                            <div className="organ-health-bar">
                                <motion.div
                                    className={`organ-health-fill bg-${organ.status}`}
                                    animate={{ width: `${organ.healthPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Organ Knowledge Modal */}
                <AnimatePresence>
                    {selectedOrgan && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrgan(null)}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3>{selectedOrgan.icon} {selectedOrgan.name} — {statusLabels[selectedOrgan.status]}</h3>
                                <p>{selectedOrgan.description}</p>
                                <p style={{ fontStyle: 'italic', color: 'var(--c-accent)' }}>
                                    "{selectedOrgan.quote}"
                                </p>
                                <button
                                    className="btn btn-accent btn-sm modal-close"
                                    onClick={() => setSelectedOrgan(null)}
                                >
                                    知道了
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>


            </div>
        </div>
    );
}
