/* ── V1 useCameraDriftDebug ──
   React hook: polls RuntimeState.camera.drift each frame via rAF.
   Returns drift + warning for debug UI overlay. */

import { useEffect, useState } from "react";

export interface DriftDebugInfo {
  position: number;
  target: number;
  zoom: number;
}

export function useCameraDriftDebug(runtime: any): {
  drift: DriftDebugInfo | null;
  warning: boolean;
} {
  const [drift, setDrift] = useState<DriftDebugInfo | null>(null);

  useEffect(() => {
    let raf: number;
    let running = true;

    const loop = () => {
      if (!running) return;
      const cam = runtime?.state?.camera;
      if (cam?.drift) {
        setDrift({ ...cam.drift });
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [runtime]);

  return {
    drift,
    warning: runtime?.state?.camera?.isDriftWarning ?? false,
  };
}
