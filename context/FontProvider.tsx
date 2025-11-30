import { SkFont, useFont } from "@shopify/react-native-skia";
import React, { createContext, ReactNode, useContext } from "react";

// Define the shape of the fonts your app provides
export interface FontContextValue {
  h1: SkFont;
  h2: SkFont;
  h5: SkFont;
}

const FontContext = createContext<FontContextValue | null>(null);

interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const h1 = useFont(require('@/assets/fonts/Metropolis-Regular.ttf'), 16);
  const h2 = useFont(require('@/assets/fonts/Metropolis-Regular.ttf'), 16);
  const h5 = useFont(require('@/assets/fonts/Metropolis-Regular.ttf'), 16);

  const loaded = h1 && h2 && h5;

  // While fonts load, you can return null OR a loading screen
  if (!loaded) return null;

  return (
    <FontContext.Provider value={{ h1, h2, h5 }}>
      {children}
    </FontContext.Provider>
  );
};

// Hook to access fonts
export const useSkiaFonts = (): FontContextValue => {
  const ctx = useContext(FontContext);
  if (!ctx) {
    throw new Error("useSkiaFonts must be used inside a <FontProvider>");
  }
  return ctx;
};