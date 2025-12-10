import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ResultsList = ({ keyword, results = [], onReset, onDownload, hasReport }) => {
    const { t } = useLanguage();

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-space-card/80 backdrop-blur-md rounded-2xl border border-white/10 sticky top-0 z-20 shadow-lg">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-accent-blue/20 transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-semibold">{t.backButton}</span>
                </button>

                <div className="flex items-center gap-4">
                    {hasReport && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-blue/30 transition-all"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Download Report</span>
                        </motion.button>
                    )}
                    <div className="text-right">
                        <p className="text-xs text-blue-300 uppercase tracking-widest">Query</p>
                        <h2 className="text-xl font-bold text-white leading-none">{keyword}</h2>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex gap-4 mb-4 px-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-space-card/50 rounded-xl border border-white/10">
                    <FileText size={16} className="text-blue-300" />
                    <span className="text-white font-semibold">{results.length}</span>
                    <span className="text-blue-300 text-sm">Results</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-green-400 font-semibold">{validCount}</span>
                    <span className="text-green-300/60 text-sm">Valid</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                    <XCircle size={16} className="text-red-400" />
                    <span className="text-red-400 font-semibold">{invalidCount}</span>
                    <span className="text-red-300/60 text-sm">Invalid</span>
                </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20 scrollbar-hide">
                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-6xl mb-4">🔭</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                        <p className="text-blue-300/60">Try a different search query</p>
                    </div>
                ) : (
                    results.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 bg-gradient-to-r from-space-card/40 to-space-card/10 backdrop-blur-md rounded-3xl border border-white/5 hover:border-accent-blue/30 transition-all group hover:shadow-[0_0_20px_rgba(76,201,240,0.1)] relative overflow-hidden"
                        >
                            {/* Status indicator */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${item.isValid ? 'bg-green-500' : 'bg-red-500'}`} />

                            <div className="flex items-start gap-4 ml-2">
                                <div className={`p-3 rounded-2xl font-mono font-bold ${item.isValid
                                        ? 'bg-gradient-to-br from-green-500/20 to-accent-blue/20 text-green-400'
                                        : 'bg-gradient-to-br from-red-500/20 to-accent-purple/20 text-red-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-blue transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>

                                    {item.authors && (
                                        <p className="text-blue-200/60 text-sm mb-2 truncate">
                                            {item.authors}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${item.isValid
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {item.isValid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {item.isValid ? 'Link Valid' : 'Link Invalid'}
                                        </span>

                                        {item.link && (
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-semibold hover:bg-accent-blue/20 transition-colors flex items-center gap-1 border border-accent-blue/30"
                                            >
                                                <ExternalLink size={12} />
                                                View Source
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResultsList;
