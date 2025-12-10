import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import SpaceBackground from './components/SpaceBackground';
import LanguageToggle from './components/LanguageToggle';
import ScraperForm from './components/ScraperForm';
import LoadingScreen from './components/LoadingScreen';
import ResultsList from './components/ResultsList';
import { scrapeJournals, downloadBase64File } from './services/api';
import './App.css';
import SplashScreen from './components/SplashScreen';

function AppContent() {
  const [appState, setAppState] = useState('input');
  const [showSplash, setShowSplash] = useState(true);
  const [formData, setFormData] = useState({ keyword: '', quantity: 10 });
  const [results, setResults] = useState([]);
  const [reportBase64, setReportBase64] = useState('');
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const startScraping = useCallback(async (data) => {
    setFormData(data);
    setAppState('loading');
    setError('');
    setResults([]);
    setReportBase64('');

    try {
      setLoadingMessage('Connecting to journal database...');

      // Call the backend API using service
      const result = await scrapeJournals(data.keyword, data.quantity);

      setLoadingMessage('Processing results...');

      if (!result.success) {
        throw new Error(result.error || 'Scraping failed');
      }

      // Store results and report
      setResults(result.data || []);
      setReportBase64(result.report || '');

      // Small delay to show completion animation
      setTimeout(() => {
        setAppState('results');
      }, 500);

    } catch (err) {
      console.error('Scraping error:', err);
      setError(err.message || 'An unexpected error occurred');
      setAppState('error');
    }
  }, []);

  const downloadReport = useCallback(() => {
    if (!reportBase64) return;

    try {
      downloadBase64File(reportBase64, `journal-report-${formData.keyword}.docx`);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report');
    }
  }, [reportBase64, formData.keyword]);

  const resetApp = useCallback(() => {
    setAppState('input');
    setFormData({ keyword: '', quantity: 10 });
    setResults([]);
    setReportBase64('');
    setError('');
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      <SpaceBackground />
      <LanguageToggle />

      <div className="relative z-10 min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {appState === 'input' && (
              <ScraperForm key="form" onStart={startScraping} />
            )}

            {appState === 'loading' && (
              <LoadingScreen key="loading" message={loadingMessage} />
            )}

            {appState === 'results' && (
              <ResultsList
                key="results"
                keyword={formData.keyword}
                results={results}
                onReset={resetApp}
                onDownload={downloadReport}
                hasReport={!!reportBase64}
              />
            )}

            {appState === 'error' && (
              <div key="error" className="flex flex-col items-center justify-center p-8 bg-space-card backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 max-w-md">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
                <p className="text-red-300 text-center mb-6">{error}</p>
                <button
                  onClick={resetApp}
                  className="px-6 py-3 bg-gradient-to-r from-accent-pink to-accent-purple text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            )}
          </AnimatePresence>
        </main>

        <footer className="p-4 text-center text-xs text-white/60 relative z-10">
          &copy; Wisnu Botanical Journal Scraper
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
