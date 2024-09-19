/* eslint-disable */
// AudioContext.tsx
// audioContext.tsx
const AudioControl = (function() {
  let isAudioEnabled = localStorage.getItem('audioEnabled') === 'true';

  function saveAudioState() {
    localStorage.setItem('audioEnabled', isAudioEnabled.toString());
  }

  function toggleAudioState() {
    isAudioEnabled = !isAudioEnabled;
    saveAudioState();
    updateAudioButtonUI();
  }

  function getAudioState() {
    return isAudioEnabled;
  }

  function updateAudioButtonUI() {
    const toggleAudioButton = document.getElementById('toggleAudioButton');
    if (toggleAudioButton) {
      toggleAudioButton.textContent = isAudioEnabled ? 'Audio Enabled' : 'Audio Disabled';
      toggleAudioButton.className = isAudioEnabled ? 'audio-enabled' : 'audio-disabled';
    }
  }

  return {
    toggleAudioState,
    getAudioState,
    updateAudioButtonUI,
  };
})();

export default AudioControl;

// import React, { createContext, useState, ReactNode} from 'react';

// type AudioContextType = {
//   isAudioEnabled: boolean;
//   setIsAudioEnabled: (enabled: boolean) => void;
// };

// // Crear el contexto con un valor predeterminado para evitar undefined
// export const AudioContext = createContext<AudioContextType>({
//   isAudioEnabled: false,
//   setIsAudioEnabled: () => {},
// });

// // Proveedor de contexto
// export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [isAudioEnabled, setIsAudioEnabled] = useState(false);

//   return (
//     <AudioContext.Provider value={{ isAudioEnabled, setIsAudioEnabled }}>
//       {children}
//     </AudioContext.Provider>
//   );
// };
