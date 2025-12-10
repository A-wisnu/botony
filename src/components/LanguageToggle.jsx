import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg hover:bg-white/30 transition-all"
        >
            <Globe size={18} className="text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wide">
                {language === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
            </span>
        </motion.button>
    );
};

export default LanguageToggle;
