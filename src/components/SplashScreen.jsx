import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
    const [stage, setStage] = useState('logo'); // 'logo', 'credit', 'finished'

    useEffect(() => {
        // Total duration for one image cycle should match CSS animation (2s)
        // We can add a slight buffer or just rely on timeouts.

        // Stage 1: Logo
        const logoTimeout = setTimeout(() => {
            setStage('credit');
        }, 2500); // 2s animation + 0.5s buffer

        // Stage 2: Credit
        const creditTimeout = setTimeout(() => {
            setStage('finished');
            onFinish();
        }, 5000); // 2.5s for logo + 2.5s for credit

        return () => {
            clearTimeout(logoTimeout);
            clearTimeout(creditTimeout);
        };
    }, [onFinish]);

    if (stage === 'finished') return null;

    return (
        <div className="splash-screen">
            {stage === 'logo' && (
                <img src="/logo.png" alt="Logo" className="splash-logo" />
            )}
            {stage === 'credit' && (
                <img src="/credit.png" alt="Credit" className="splash-logo" />
            )}
        </div>
    );
};

export default SplashScreen;
