import { appWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "preact/hooks";

export const useTheme = () => {
  const theme = useRef("light");

  useEffect(() => {
    const getThemeFromTauri = async () => {
      try {
        const tauriTheme = await appWindow.theme();
        theme.current = tauriTheme as string;
      } catch (error) {
        console.warn("running in browser");
      }
    };
    getThemeFromTauri();
  }, []);

  return theme.current;
};
