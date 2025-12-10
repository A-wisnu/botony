import React, { createContext, useContext, useState } from 'react';

const translations = {
    en: {
        title: "Botanical Journal Scraper",
        subtitle: "Harvest academic knowledge from the ecosystem.",
        journalLabel: "Journal Title / Topic",
        journalPlaceholder: "e.g., Photosynthesis, Climate Change...",
        quantityLabel: "Quantity of Files",
        startButton: "Start Harvesting",
        loadingMessages: [
            "Initializing ecosystem...",
            "Scraping ecosystem...",
            "Verifying roots...",
            "Extracting data...",
            "Polishing results..."
        ],
        resultsTitle: "Harvested Journals",
        resultsSubtitle: "Found based on",
        downloadButton: "Download All & Report",
        verifying: "Verifying",
        valid: "Valid",
        broken: "Broken",
        viewSource: "View Source",
        footer: "Designed with nature in mind"
    },
    id: {
        title: "Pencari Jurnal Botani",
        subtitle: "Panen pengetahuan akademik dari ekosistem.",
        journalLabel: "Judul Jurnal / Topik",
        journalPlaceholder: "contoh: Fotosintesis, Perubahan Iklim...",
        quantityLabel: "Jumlah File",
        startButton: "Mulai Panen",
        loadingMessages: [
            "Menginisialisasi ekosistem...",
            "Mengambil data ekosistem...",
            "Memverifikasi akar...",
            "Mengekstrak data...",
            "Memoles hasil..."
        ],
        resultsTitle: "Jurnal Terpanen",
        resultsSubtitle: "Ditemukan berdasarkan",
        downloadButton: "Unduh Semua & Laporan",
        verifying: "Memverifikasi",
        valid: "Valid",
        broken: "Rusak",
        viewSource: "Lihat Sumber",
        footer: "Dirancang dengan alam dalam pikiran"
    }
};

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'id' : 'en');
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
