import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhackAMolePageProps {
    bac: number;
    onBack: () => void;
}

interface GameState {
    phase: 'ready' | 'sober-test' | 'drunk-test' | 'result';
    score: number;
    totalTargets: number;
    targetsShown: number;
    targetPos: { x: number; y: number } | null;
    timeLeft: number;
    reactionTimes: number[];
}

const GAME_DURATION = 15; // seconds
const TARGET_INTERVAL_BASE = 1200; // ms

export default function WhackAMolePage({ bac, onBack }: WhackAMolePageProps) {
    const [soberResult, setSoberResult] = useState<{ score: number; avg: number } | null>(null);
    const [game, setGame] = useState<GameState>({
        phase: 'ready',
        score: 0,
        totalTargets: 0,
        targetsShown: 0,
        targetPos: null,
        timeLeft: GAME_DURATION,
        reactionTimes: [],
    });

    const arenaRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const targetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const targetAppearedAt = useRef<number>(0);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
        };
    }, []);

    // Random position for target
    const getRandomPos = useCallback(() => {
        return {
            x: 10 + Math.random() * 75, // percentage
            y: 10 + Math.random() * 70,
        };
    }, []);

    // Spawn new target
    const spawnTarget = useCallback((isDrunk: boolean) => {
        // Add jitter for drunk mode
        const jitter = isDrunk ? (Math.random() - 0.5) * bac * 100 : 0;
        const pos = getRandomPos();
        pos.x = Math.max(5, Math.min(85, pos.x + jitter));
        pos.y = Math.max(5, Math.min(80, pos.y + jitter));

        targetAppearedAt.current = Date.now();

        setGame((prev) => ({
            ...prev,
            targetPos: pos,
            totalTargets: prev.totalTargets + 1,
        }));

        // Auto-hide target after some time
        const hideDelay = isDrunk ? Math.max(600, 1000 - bac * 2000) : 1000;
        targetTimerRef.current = setTimeout(() => {
            setGame((prev) => ({ ...prev, targetPos: null }));
            // Spawn next
            const nextDelay = isDrunk
                ? TARGET_INTERVAL_BASE + Math.random() * 400
                : TARGET_INTERVAL_BASE - 200 + Math.random() * 300;
            targetTimerRef.current = setTimeout(() => spawnTarget(isDrunk), nextDelay);
        }, hideDelay);
    }, [bac, getRandomPos]);

    // Start game
    const startGame = useCallback((phase: 'sober-test' | 'drunk-test') => {
        setGame({
            phase,
            score: 0,
            totalTargets: 0,
            targetsShown: 0,
            targetPos: null,
            timeLeft: GAME_DURATION,
            reactionTimes: [],
        });

        // Countdown timer
        timerRef.current = setInterval(() => {
            setGame((prev) => {
                const newTime = prev.timeLeft - 1;
                if (newTime <= 0) {
                    clearInterval(timerRef.current);
                    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);

                    if (phase === 'sober-test') {
                        const avgReaction = prev.reactionTimes.length > 0
                            ? prev.reactionTimes.reduce((a, b) => a + b, 0) / prev.reactionTimes.length
                            : 0;
                        setSoberResult({ score: prev.score, avg: avgReaction });
                        return { ...prev, timeLeft: 0, phase: 'drunk-test', targetPos: null };
                    } else {
                        return { ...prev, timeLeft: 0, phase: 'result', targetPos: null };
                    }
                }
                return { ...prev, timeLeft: newTime };
            });
        }, 1000);

        // Start spawning targets
        setTimeout(() => spawnTarget(phase === 'drunk-test'), 500);
    }, [spawnTarget]);

    // Hit target
    const handleHit = useCallback(() => {
        const reactionTime = Date.now() - targetAppearedAt.current;
        if (targetTimerRef.current) clearTimeout(targetTimerRef.current);

        setGame((prev) => ({
            ...prev,
            score: prev.score + 1,
            targetPos: null,
            reactionTimes: [...prev.reactionTimes, reactionTime],
        }));

        // Spawn next target
        const isDrunk = game.phase === 'drunk-test';
        const delay = isDrunk ? 500 + Math.random() * 500 : 300 + Math.random() * 300;
        targetTimerRef.current = setTimeout(() => spawnTarget(isDrunk), delay);
    }, [game.phase, spawnTarget]);

    // Average reaction time
    const avgReaction = game.reactionTimes.length > 0
        ? Math.round(game.reactionTimes.reduce((a, b) => a + b, 0) / game.reactionTimes.length)
        : 0;

    // Cursor shake for drunk mode
    const drunkStyle = game.phase === 'drunk-test' && bac > 0.03
        ? { animation: `shake ${Math.max(0.3, 1 - bac * 3)}s infinite` }
        : {};

    return (
        <div className="page-scroll">
            <motion.div
                className="game-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>🎯 反应力测试</h1>
                <p className="game-subtitle">
                    {game.phase === 'ready' && '测试你在不同醉酒状态下的反应速度！'}
                    {game.phase === 'sober-test' && '🟢 清醒测试 — 尽快点击出现的红色目标！'}
                    {game.phase === 'drunk-test' && `🔴 醉酒测试（BAC: ${(bac * 100).toFixed(2)}%）— 注意，你的手可能会"抖"！`}
                    {game.phase === 'result' && '测试完成！来看看对比结果'}
                </p>

                {/* Game Stats */}
                {(game.phase === 'sober-test' || game.phase === 'drunk-test') && (
                    <div className="game-stats">
                        <div className="game-stat">
                            <span className="game-stat-value" style={{ color: 'var(--c-accent)' }}>{game.score}</span>
                            <span className="game-stat-label">命中</span>
                        </div>
                        <div className="game-stat">
                            <span className="game-stat-value" style={{ color: 'var(--c-warning)' }}>{game.timeLeft}s</span>
                            <span className="game-stat-label">剩余时间</span>
                        </div>
                        <div className="game-stat">
                            <span className="game-stat-value">{avgReaction}ms</span>
                            <span className="game-stat-label">平均反应</span>
                        </div>
                    </div>
                )}

                {/* Game Arena */}
                {(game.phase === 'sober-test' || game.phase === 'drunk-test') && (
                    <div className="game-arena" ref={arenaRef} style={drunkStyle}>
                        <AnimatePresence>
                            {game.targetPos && (
                                <motion.div
                                    className="game-target"
                                    style={{
                                        left: `${game.targetPos.x}%`,
                                        top: `${game.targetPos.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={handleHit}
                                >
                                    🎯
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!game.targetPos && game.timeLeft > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'var(--c-text-dim)',
                                fontSize: 'var(--fs-lg)',
                            }}>
                                等待目标出现...
                            </div>
                        )}
                    </div>
                )}

                {/* Ready Screen */}
                {game.phase === 'ready' && (
                    <motion.div
                        className="card"
                        style={{ padding: 'var(--sp-2xl)', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p style={{ fontSize: '4rem', marginBottom: 'var(--sp-lg)' }}>🎯</p>
                        <p style={{ marginBottom: 'var(--sp-md)', color: 'var(--c-text-dim)' }}>
                            测试分为两轮：<br />
                            1️⃣ <strong>清醒基准</strong>：测试你的正常反应速度<br />
                            2️⃣ <strong>醉酒测试</strong>：在当前 BAC {(bac * 100).toFixed(2)}% 下重新测试
                        </p>
                        <p style={{ marginBottom: 'var(--sp-xl)', fontSize: 'var(--fs-sm)', color: 'var(--c-text-dim)' }}>
                            醉酒模式下，目标会"抖动"，模拟手不稳的效果
                        </p>
                    </motion.div>
                )}

                {/* Result Screen */}
                {game.phase === 'result' && soberResult && (
                    <motion.div
                        className="game-result card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>📊 对比结果</h2>
                        <div className="game-comparison">
                            <div className="comparison-item">
                                <h4>🟢 清醒状态</h4>
                                <div className="comparison-value" style={{ color: 'var(--c-accent)' }}>
                                    {soberResult.score} 分
                                </div>
                                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-dim)', marginTop: 'var(--sp-sm)' }}>
                                    平均反应 {Math.round(soberResult.avg)}ms
                                </div>
                            </div>
                            <div className="comparison-vs">VS</div>
                            <div className="comparison-item">
                                <h4>🔴 醉酒状态</h4>
                                <div className="comparison-value" style={{ color: 'var(--c-danger)' }}>
                                    {game.score} 分
                                </div>
                                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-dim)', marginTop: 'var(--sp-sm)' }}>
                                    平均反应 {avgReaction}ms
                                </div>
                            </div>
                        </div>

                        {/* Performance drop */}
                        {soberResult.score > 0 && (
                            <motion.div
                                style={{
                                    marginTop: 'var(--sp-xl)',
                                    padding: 'var(--sp-lg)',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    borderRadius: 'var(--r-md)',
                                    textAlign: 'center',
                                }}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                            >
                                <p style={{ fontSize: 'var(--fs-2xl)', fontWeight: 900, color: 'var(--c-danger)' }}>
                                    反应力下降 {Math.max(0, Math.round((1 - game.score / soberResult.score) * 100))}%
                                </p>
                                <p style={{ color: 'var(--c-text-dim)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-sm)' }}>
                                    这就是为什么酒后绝对不能开车！
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Actions */}
                <div className="game-actions">
                    {game.phase === 'ready' && (
                        <motion.button
                            className="btn btn-accent btn-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startGame('sober-test')}
                        >
                            🚀 开始测试
                        </motion.button>
                    )}
                    {game.phase === 'drunk-test' && game.timeLeft <= 0 && (
                        <motion.button
                            className="btn btn-accent btn-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startGame('drunk-test')}
                        >
                            🔄 再测一次
                        </motion.button>
                    )}
                    {game.phase === 'sober-test' && game.timeLeft <= 0 && (
                        <motion.button
                            className="btn btn-primary btn-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startGame('drunk-test')}
                        >
                            🍺 进入醉酒测试
                        </motion.button>
                    )}
                    <button className="btn btn-ghost" onClick={onBack}>
                        ← 返回喝酒
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
