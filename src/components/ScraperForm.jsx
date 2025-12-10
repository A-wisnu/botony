import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Rocket, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ScraperForm = ({ onStart }) => {
    const { t } = useLanguage();
    const [keyword, setKeyword] = useState('');
    const [quantity, setQuantity] = useState(10);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyword && quantity > 0) {
            onStart({ keyword, quantity });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex flex-col items-center justify-center p-8 md:p-12 bg-space-card backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/10 w-full max-w-lg relative overflow-hidden"
        >
            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-blue/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-purple/20 rounded-full blur-[80px]"></div>

            <div className="mb-8 text-center relative z-10">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block mb-4 p-4 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue shadow-lg shadow-accent-purple/30"
                >
                    <Rocket size={40} className="text-white transform -rotate-45" strokeWidth={1.5} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3 drop-shadow-md">
                    {t.title}
                </h1>
                <p className="text-center text-blue-200/80 text-lg font-medium">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 relative z-10">
                <div className="space-y-2 group">
                    <label className="text-sm font-bold text-blue-300 ml-1 tracking-wide uppercase">{t.journalLabel}</label>
                    <div className="relative transition-all duration-300 transform group-hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-blue group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder={t.journalPlaceholder}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-space-deep/60 border border-white/10 focus:border-accent-blue/50 focus:ring-4 focus:ring-accent-blue/20 outline-none text-white font-medium transition-all placeholder:text-blue-400/50 relative z-10"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="text-sm font-bold text-blue-300 ml-1 tracking-wide uppercase">{t.quantityLabel}</label>
                    <div className="relative transition-all duration-300 transform group-hover:scale-[1.02]">
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            min="1"
                            max="100"
                            className="w-full px-4 py-4 rounded-2xl bg-space-deep/60 border border-white/10 focus:border-accent-pink/50 focus:ring-4 focus:ring-accent-pink/20 outline-none text-white font-bold text-center text-xl transition-all relative z-10"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(247, 37, 133, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full py-5 mt-8 bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue text-white font-bold text-xl rounded-2xl shadow-xl border border-white/20 relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <Sparkles size={24} />
                        {t.startButton}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </motion.button>
            </form>
        </motion.div>
    );
};

export default ScraperForm;
