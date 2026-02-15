import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Character, Gender, AlcoholTolerance } from '../types';

interface CharacterCreatePageProps {
    onComplete: (character: Character) => void;
}

export default function CharacterCreatePage({ onComplete }: CharacterCreatePageProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [weight, setWeight] = useState(65);
    const [age, setAge] = useState(25);
    const [isEmptyStomach, setIsEmptyStomach] = useState(false);
    const [tolerance, setTolerance] = useState<AlcoholTolerance>('medium');

    const handleSubmit = () => {
        onComplete({
            name: name || (gender === 'male' ? '张三' : '李四'),
            gender,
            weight,
            age,
            isEmptyStomach,
            tolerance,
        });
    };

    const avatar = gender === 'male' ? '🧑' : '👩';

    return (
        <div className="page-scroll">
            <motion.div
                className="character-create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>🎭 创建你的角色</h1>
                <p className="character-create-sub">设置你的基本信息，我们将模拟酒精对你身体的影响</p>

                {/* Preview */}
                <motion.div className="character-preview card" layout>
                    <span className="preview-avatar">{avatar}</span>
                    <div className="preview-stats">
                        <span>📛 {name || (gender === 'male' ? '张三' : '李四')}</span>
                        <span>⚖️ {weight}kg</span>
                        <span>🎂 {age}岁</span>
                        <span>{isEmptyStomach ? '🫗 空腹' : '🍞 已进食'}</span>
                    </div>
                </motion.div>

                {/* Name */}
                <div className="form-section">
                    <div className="form-label">
                        <span>📛 昵称</span>
                    </div>
                    <input
                        type="text"
                        className="name-input"
                        placeholder={gender === 'male' ? '张三' : '李四'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={10}
                    />
                </div>

                {/* Gender */}
                <div className="form-section">
                    <div className="form-label"><span>👤 性别</span></div>
                    <div className="gender-select">
                        <button
                            className={`gender-option ${gender === 'male' ? 'active' : ''}`}
                            onClick={() => setGender('male')}
                        >
                            <span className="gender-emoji">🧑</span>
                            男性
                        </button>
                        <button
                            className={`gender-option ${gender === 'female' ? 'active' : ''}`}
                            onClick={() => setGender('female')}
                        >
                            <span className="gender-emoji">👩</span>
                            女性
                        </button>
                    </div>
                </div>

                {/* Weight */}
                <div className="form-section">
                    <div className="form-label">
                        <span>⚖️ 体重</span>
                        <span className="form-value">{weight} kg</span>
                    </div>
                    <input
                        type="range"
                        min={30}
                        max={150}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                    />
                </div>

                {/* Age */}
                <div className="form-section">
                    <div className="form-label">
                        <span>🎂 年龄</span>
                        <span className="form-value">{age} 岁</span>
                    </div>
                    <input
                        type="range"
                        min={18}
                        max={80}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                    />
                </div>

                {/* Empty Stomach */}
                <div className="form-section">
                    <div className="toggle-row">
                        <span>🫗 是否空腹？（空腹吸收更快 +30%）</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isEmptyStomach}
                                onChange={(e) => setIsEmptyStomach(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Tolerance */}
                <div className="form-section">
                    <div className="form-label"><span>🍻 酒量自评</span></div>
                    <div className="tolerance-select">
                        {([
                            { value: 'low' as const, emoji: '😵', label: '不胜酒力' },
                            { value: 'medium' as const, emoji: '😊', label: '一般般' },
                            { value: 'high' as const, emoji: '😎', label: '海量' },
                        ]).map((opt) => (
                            <button
                                key={opt.value}
                                className={`tolerance-option ${tolerance === opt.value ? 'active' : ''}`}
                                onClick={() => setTolerance(opt.value)}
                            >
                                <span className="tolerance-emoji">{opt.emoji}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <motion.button
                        className="btn btn-accent btn-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                    >
                        🚀 开始模拟
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
