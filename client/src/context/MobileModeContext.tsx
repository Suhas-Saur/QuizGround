import React, { createContext, useContext, useEffect, useState } from 'react';

interface MobileModeContextType {
  isMobile: boolean; // True on real mobile devices or when simulated mobile mode is ON
  isSimulatedMobile: boolean; // True only when toggled on desktop
  toggleMobileMode: () => void;
  setSimulatedMobile: (val: boolean) => void;
}

const MobileModeContext = createContext<MobileModeContextType | undefined>(undefined);

export const MobileModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScreenSmall, setIsScreenSmall] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isSimulatedMobile, setIsSimulatedMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quizarena_mobile_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMode = () => {
    setIsSimulatedMobile(prev => {
      const next = !prev;
      localStorage.setItem('quizarena_mobile_mode', String(next));
      return next;
    });
  };

  const setSimulatedMobile = (val: boolean) => {
    setIsSimulatedMobile(val);
    localStorage.setItem('quizarena_mobile_mode', String(val));
  };

  const isMobile = isScreenSmall || isSimulatedMobile;

  return (
    <MobileModeContext.Provider
      value={{
        isMobile,
        isSimulatedMobile,
        toggleMobileMode,
        setSimulatedMobile
      }}
    >
      {children}
    </MobileModeContext.Provider>
  );
};

export const useMobileMode = () => {
  const context = useContext(MobileModeContext);
  if (!context) {
    throw new Error('useMobileMode must be used within a MobileModeProvider');
  }
  return context;
};
