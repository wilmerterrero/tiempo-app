import { appWindow } from "@tauri-apps/api/window";
import { useEffect } from "preact/hooks";

export const useTheme = () => {
  let theme = "dark";

  useEffect(() => {
    const getThemeFromTauri = async () => {
      try {
        const tauriTheme = await appWindow.theme();
        theme = tauriTheme as string;
      } catch (error) {
        console.warn("running in browser");
      }
    };
    getThemeFromTauri();
  }, []);

  return theme;
};
