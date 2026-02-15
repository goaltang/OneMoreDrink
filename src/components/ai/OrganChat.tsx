import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProvider, PROMPT_TEMPLATES } from '../../ai/provider';
import type { AIMessage, OrganState } from '../../types';

interface OrganChatProps {
    bac: number;
    organs: OrganState[];
}

export default function OrganChat({ bac, organs }: OrganChatProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastBacTrigger, setLastBacTrigger] = useState(0);

    // Trigger chat when BAC increases significantly (every 0.03%)
    useEffect(() => {
        if (bac > 0.02 && (bac - lastBacTrigger >= 0.03 || (lastBacTrigger === 0 && bac > 0.02))) {
            generateDialog();
            setLastBacTrigger(bac);
        }
    }, [bac, lastBacTrigger]);

    const generateDialog = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const provider = createProvider();
            const liver = organs.find(o => o.type === 'liver');
            const brain = organs.find(o => o.type === 'brain');

            const prompt = PROMPT_TEMPLATES['organ-dialog']({
                liverLoad: ((100 - (liver?.healthPercent || 100))).toFixed(0),
                brainClarity: (brain?.healthPercent || 100).toFixed(0),
                bac: (bac * 100).toFixed(2),
            });

            const aiMessages: AIMessage[] = [
                { role: 'user', content: prompt }
            ];

            const response = await provider.chat(aiMessages);
            // Split response into simple lines if possible, or just show as one block
            const lines = response.split('\n').filter(line => line.trim().length > 0);
            setMessages(lines.slice(0, 3)); // Limit to 3 lines
            setIsVisible(true);

            // Auto hide after 10 seconds
            setTimeout(() => setIsVisible(false), 10000);

        } catch (err) {
            console.error('Organ Chat Error:', err);
        } finally {
            setLoading(false);
        }
    }, [bac, organs, loading]);

    if (!isVisible && !loading) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="organ-chat-bubble"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: -200, bottom: 0 }}
                >
                    <div className="chat-header">
                        <span style={{ fontSize: '1.2rem' }}>🧠 🫀</span>
                        <button className="btn-close-xs" onClick={() => setIsVisible(false)}>×</button>
                    </div>
                    <div className="chat-content">
                        {messages.map((msg, i) => (
                            <p key={i} className="chat-line">{msg}</p>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
