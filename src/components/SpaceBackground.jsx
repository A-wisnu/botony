import React, { useMemo } from 'react';
import './SpaceBackground.css';

const SpaceBackground = () => {
    // Generate random particles
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
        }));
    }, []);

    return (
        <div className="space-background">
            {/* Stars Layer */}
            <div className="stars"></div>

            {/* Planets */}
            <div className="planet-container">
                <div className="planet"></div>
                <div className="planet-ring"></div>
            </div>

            <div className="planet-small"></div>

            {/* Shooting Star */}
            <div className="shooting-star"></div>

            {/* Floating Particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="particle"
                    style={p}
                ></div>
            ))}
        </div>
    );
};

export default SpaceBackground;
