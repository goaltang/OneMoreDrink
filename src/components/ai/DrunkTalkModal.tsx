import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProvider, PROMPT_TEMPLATES, getConfiguredProvider } from '../../ai/provider';
import type { AIMessage } from '../../types';

interface DrunkTalkModalProps {
    isOpen: boolean;
    onClose: () => void;
    bac: number;
}

export default function DrunkTalkModal({ isOpen, onClose, bac }: DrunkTalkModalProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const providerType = getConfiguredProvider();

    const handleTranslate = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setError('');
        setOutput('');

        try {
            const provider = createProvider();
            const prompt = PROMPT_TEMPLATES['drunk-talk']({
                bac: (bac * 100).toFixed(2) + '%',
                input
            });

            const messages: AIMessage[] = [
                { role: 'user', content: prompt }
            ];

            const response = await provider.chat(messages);
            setOutput(response);
        } catch (err: any) {
            console.error('AI Error:', err);
            setError(err.message || 'AI 喝多了，没反应过来...');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '600px' }}
                    >
                        <h3>🥴 酒后真言生成器</h3>

                        {providerType === 'none' && (
                            <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                ⚠️ 未配置 AI API Key。目前使用模拟模式 (Mock)。
                            </div>
                        )}

                        <div className="form-section">
                            <label className="form-label">输入你想说的话（清醒版）：</label>
                            <textarea
                                className="name-input"
                                rows={3}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="比如：我其实一直很喜欢你..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        {error && (
                            <div style={{ color: 'var(--c-danger)', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        {output && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="drunk-output"
                                style={{
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    padding: '1rem',
                                    borderRadius: 'var(--r-md)',
                                    border: '1px solid var(--c-accent)',
                                    marginBottom: '1rem',
                                    fontStyle: 'italic',
                                    color: 'var(--c-accent)'
                                }}
                            >
                                {output}
                            </motion.div>
                        )}

                        <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-ghost" onClick={onClose}>
                                取消
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleTranslate}
                                disabled={loading || !input.trim()}
                            >
                                {loading ? '生成中...' : '🍶 生成醉话'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
