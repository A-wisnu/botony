import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

const LoadingScreen = ({ message = 'Scanning universe for data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] relative z-10 w-full max-w-lg mx-auto bg-space-card/20 backdrop-blur-md rounded-3xl p-10 border border-white/10 shadow-2xl">
      <motion.div
        animate={{
          y: [-20, -100],
          x: [0, 5, -5, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{
          y: { duration: 3, ease: "easeIn", repeat: Infinity },
          x: { duration: 0.2, repeat: Infinity },
          rotate: { duration: 0.2, repeat: Infinity }
        }}
        className="mb-8 relative"
      >
        {/* Rocket flame */}
        <motion.div
          animate={{ height: [40, 60, 40], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.2, repeat: Infinity }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-4 bg-gradient-to-t from-transparent via-accent-orange to-accent-pink blur-sm"
          style={{ borderRadius: '0 0 50% 50%' }}
        />

        <Rocket size={80} className="text-white drop-shadow-[0_0_15px_rgba(76,201,240,0.5)]" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-4 tracking-wider uppercase">Initiating Launch</h2>

      <div className="w-full h-2 bg-space-deep rounded-full overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "30%", "50%", "70%", "90%", "95%"] }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          }}
          className="h-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink shadow-[0_0_10px_rgba(247,37,133,0.5)]"
        />
      </div>
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-blue-200/60 font-mono text-sm"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
