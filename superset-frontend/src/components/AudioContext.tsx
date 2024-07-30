// AudioContext.tsx
import React, { createContext, useState, ReactNode} from 'react';

type AudioContextType = {
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
};

// Crear el contexto con un valor predeterminado para evitar undefined
export const AudioContext = createContext<AudioContextType>({
  isAudioEnabled: false,
  setIsAudioEnabled: () => {},
});

// Proveedor de contexto
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  return (
    <AudioContext.Provider value={{ isAudioEnabled, setIsAudioEnabled }}>
      {children}
    </AudioContext.Provider>
  );
};
