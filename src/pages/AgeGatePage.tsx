import { motion } from 'framer-motion';

interface AgeGatePageProps {
    onConfirm: () => void;
}

export default function AgeGatePage({ onConfirm }: AgeGatePageProps) {
    return (
        <div className="page">
            <motion.div
                className="age-gate"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="age-gate-emoji">🍺</span>
                <h1>醉里看花</h1>
                <p className="age-gate-subtitle">酒精对人体影响的互动模拟器</p>

                <div className="age-gate-buttons">
                    <motion.button
                        className="btn btn-primary btn-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onConfirm}
                    >
                        ✅ 我已年满 18 岁
                    </motion.button>
                    <motion.button
                        className="btn btn-ghost btn-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = 'https://www.baidu.com'}
                    >
                        ❌ 未满 18 岁
                    </motion.button>
                </div>

                <div className="age-gate-disclaimer">
                    <strong>⚠️ 免责声明</strong><br />
                    本应用仅供科普娱乐，不鼓励饮酒。<br />
                    数据基于平均值估算，个体差异大，仅供参考，非医疗建议。<br />
                    如有健康问题请咨询专业医生。
                </div>
            </motion.div>
        </div>
    );
}
