import { useState, useEffect, useRef, useCallback } from 'react';

export interface Platform {
  id: string;
  x: number;       // left edge (px, relative to screen)
  y: number;       // top edge of the title bar
  width: number;
  height: number;  // title bar height (~28px on macOS)
  name: string;
  title: string;
}

interface WindowInfo {
  name: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const TITLE_BAR_HEIGHT = 28; // macOS title bar

/**
 * Polls Electron IPC for on-screen window positions
 * and converts them into walkable "platforms" (title bar edges).
 * Falls back to a single floor platform when not in Electron.
 */
export function useWindowPlatforms(enabled: boolean, pollIntervalMs = 2000) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isElectron = typeof window !== 'undefined' && 'require' in (window as any);

  const fetchPlatforms = useCallback(async () => {
    if (!isElectron) {
      // Web fallback: single floor platform
      setPlatforms([{
        id: 'floor',
        x: 0,
        y: window.innerHeight - 20,
        width: window.innerWidth,
        height: 20,
        name: 'Desktop',
        title: 'Floor'
      }]);
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      return;
    }

    try {
      const { ipcRenderer } = (window as any).require('electron');
      const result = await ipcRenderer.invoke('get-window-positions');
      const { windows, screenWidth, screenHeight } = result as {
        windows: WindowInfo[];
        screenWidth: number;
        screenHeight: number;
      };

      setScreenSize({ width: screenWidth, height: screenHeight });

      if (windows.length === 0) {
        // No windows — walk on desktop floor
        setPlatforms([{
          id: 'floor',
          x: 0,
          y: screenHeight - 20,
          width: screenWidth,
          height: 20,
          name: 'Desktop',
          title: 'Floor'
        }]);
        return;
      }

      // Convert windows to platforms (title bar = top edge)
      const plats: Platform[] = windows.map((w, i) => ({
        id: `win-${i}-${w.name}`,
        x: w.x,
        y: w.y,
        width: w.width,
        height: TITLE_BAR_HEIGHT,
        name: w.name,
        title: w.title
      }));

      // Always add floor as fallback
      plats.push({
        id: 'floor',
        x: 0,
        y: screenHeight - 20,
        width: screenWidth,
        height: 20,
        name: 'Desktop',
        title: 'Floor'
      });

      // Sort by Y ascending (highest platforms first — character prefers topmost)
      plats.sort((a, b) => a.y - b.y);

      setPlatforms(plats);
    } catch (e) {
      console.log('Window detection unavailable:', e);
      setPlatforms([{
        id: 'floor',
        x: 0,
        y: window.innerHeight - 20,
        width: window.innerWidth,
        height: 20,
        name: 'Desktop',
        title: 'Floor'
      }]);
    }
  }, [isElectron]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    fetchPlatforms();
    intervalRef.current = setInterval(fetchPlatforms, pollIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, pollIntervalMs, fetchPlatforms]);

  return { platforms, screenSize };
}
