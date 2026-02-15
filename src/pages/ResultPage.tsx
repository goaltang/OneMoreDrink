import { motion } from 'framer-motion';
import type { Character, DrinkRecord } from '../types';
import { drinks } from '../data/drinks';
import { calculateBAC, timeToSober, formatSoberTime } from '../engine/bac';
import { getAllOrganStates } from '../engine/organs';

interface ResultPageProps {
    character: Character;
    records: DrinkRecord[];
    maxBAC: number;
    onRestart: () => void;
}

/** BAC 结果评语 */
function getVerdict(bac: number) {
    if (bac < 0.02) return { emoji: '🎉', title: '理性饮酒！', msg: '你很好地控制了饮酒量，身体感谢你！' };
    if (bac < 0.05) return { emoji: '😊', title: '微醺而已', msg: '小酌怡情，但别忘了不能开车哦。' };
    if (bac < 0.08) return { emoji: '😵‍💫', title: '有点上头了', msg: '你的判断力和反应速度已经受到影响了。' };
    if (bac < 0.15) return { emoji: '🥴', title: '喝多了！', msg: '你已经超过法定醉驾标准，身体各器官在超负荷运转！' };
    return { emoji: '🚨', title: '危险！太多了！', msg: '这个量可能导致严重健康风险，请务必注意安全！' };
}

/** 健康建议 */
function getHealthTips(bac: number, character: Character): string[] {
    const tips: string[] = [];

    if (bac >= 0.02) {
        tips.push('🚗 请勿酒后驾车！叫代驾或出租车是最安全的选择。');
    }
    tips.push(`💧 多喝水！酒精会导致脱水，建议每喝一杯酒就喝一杯水。`);

    if (character.isEmptyStomach) {
        tips.push('🍞 下次喝酒前记得先吃点东西，空腹喝酒吸收速度快30%。');
    }

    if (bac >= 0.05) {
        tips.push('😴 确保充足睡眠，酒精会严重影响睡眠质量。');
        tips.push('⏰ 预计清醒时间：' + formatSoberTime(timeToSober(bac, character.age, character.gender)) + '，在这之前请勿从事需要专注力的活动。');
    }

    if (bac >= 0.08) {
        tips.push('🏥 如果感到严重不适，请及时就医。酒精中毒不是小事！');
    }

    tips.push('💡 世界卫生组织建议：对于酒精，没有绝对安全的饮用量。');

    return tips;
}

export default function ResultPage({ character, records, maxBAC, onRestart }: ResultPageProps) {
    const totalAlcohol = records.reduce((sum, r) => sum + r.alcoholGrams, 0);
    const currentBAC = calculateBAC(totalAlcohol, character.weight, character.gender, character.isEmptyStomach);
    const organStates = getAllOrganStates(maxBAC);
    const verdict = getVerdict(maxBAC);
    const tips = getHealthTips(maxBAC, character);

    // Count drinks
    const drinkSummary = records.reduce<Record<string, number>>((acc, r) => {
        acc[r.drinkId] = (acc[r.drinkId] || 0) + 1;
        return acc;
    }, {});

    const statusColors: Record<string, string> = {
        normal: 'var(--c-organ-normal)',
        mild: 'var(--c-organ-mild)',
        moderate: 'var(--c-organ-moderate)',
        severe: 'var(--c-organ-severe)',
        critical: 'var(--c-organ-critical)',
    };

    return (
        <div className="page-scroll">
            <motion.div
                className="result-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <motion.div
                    className="result-header"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="result-emoji">{verdict.emoji}</span>
                    <h1>{verdict.title}</h1>
                    <p>{verdict.msg}</p>
                </motion.div>

                {/* Summary Stats */}
                <motion.div
                    className="result-summary card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="section-title" style={{ marginBottom: 'var(--sp-lg)' }}>📊 饮酒总结</h3>
                    <div className="result-summary-grid">
                        <div className="result-stat">
                            <span className="result-stat-value">{records.length}</span>
                            <span className="result-stat-label">杯数</span>
                        </div>
                        <div className="result-stat">
                            <span className="result-stat-value">{totalAlcohol.toFixed(1)}g</span>
                            <span className="result-stat-label">酒精摄入</span>
                        </div>
                        <div className="result-stat">
                            <span className="result-stat-value" style={{ color: statusColors[organStates[0].status] }}>
                                {(maxBAC * 100).toFixed(2)}%
                            </span>
                            <span className="result-stat-label">最高 BAC</span>
                        </div>
                        <div className="result-stat">
                            <span className="result-stat-value">
                                {formatSoberTime(timeToSober(currentBAC, character.age, character.gender))}
                            </span>
                            <span className="result-stat-label">清醒倒计时</span>
                        </div>
                    </div>

                    {/* Drink breakdown */}
                    <div style={{ marginTop: 'var(--sp-lg)', display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {Object.entries(drinkSummary).map(([drinkId, count]) => {
                            const drink = drinks.find((d) => d.id === drinkId);
                            if (!drink) return null;
                            return (
                                <span key={drinkId} style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-dim)' }}>
                                    {drink.icon} {drink.name} ×{count}
                                </span>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Organ States */}
                <motion.div
                    className="result-organs card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="section-title" style={{ marginBottom: 'var(--sp-lg)' }}>🫀 器官状态报告</h3>
                    <div className="result-organ-list">
                        {organStates.map((organ, i) => (
                            <motion.div
                                key={organ.type}
                                className="result-organ-row"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <span className="result-organ-icon">{organ.icon}</span>
                                <span className="result-organ-name">{organ.name}</span>
                                <div className="result-organ-bar">
                                    <motion.div
                                        className="result-organ-fill"
                                        style={{ background: statusColors[organ.status] }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${organ.healthPercent}%` }}
                                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                                    />
                                </div>
                                <span className="result-organ-percent" style={{ color: statusColors[organ.status] }}>
                                    {organ.healthPercent}%
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Health Tips */}
                <motion.div
                    className="result-health-tips card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="section-title" style={{ marginBottom: 'var(--sp-lg)' }}>💡 健康建议</h3>
                    {tips.map((tip, i) => (
                        <motion.div
                            key={i}
                            className="health-tip"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                        >
                            {tip}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Actions */}
                <motion.div
                    className="result-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <motion.button
                        className="btn btn-accent btn-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRestart}
                    >
                        🔄 再来一次
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}
