import { useEffect, useRef } from "preact/hooks";
import { getVersion } from "@tauri-apps/api/app";

export const useAppVersion = () => {
  const version = useRef("1.0.0");

  useEffect(() => {
    const getVersionFromTauri = async () => {
      try {
        version.current = await getVersion();
      } catch (error) {
        console.warn("running in browser");
      }
    };
    getVersionFromTauri();
  }, []);

  return version.current;
};
