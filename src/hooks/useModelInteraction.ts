import { useState, useEffect, useCallback } from "react";

export function useModelInteraction() {
  const [explodeValue, setExplodeValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);

  useEffect(() => {
    if (explodeValue === 0) {
      setSelectedLayer(null);
    }
  }, [explodeValue]);

  const handleLayerClick = useCallback(
    (index: number, _layer: any, _e: { clientX: number; clientY: number }) => {
      if (explodeValue <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
    },
    [explodeValue]
  );

  const handlePanelSelect = useCallback(
    (index: number) => {
      if (explodeValue <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
    },
    [explodeValue]
  );

  const handleBlankClick = useCallback(() => {
    /* no-op: activeCard removed, selection persists */
  }, []);

  return {
    explodeValue,
    setExplodeValue,
    autoRotate,
    setAutoRotate,
    hoveredLayer,
    setHoveredLayer,
    selectedLayer,
    screenshotMode,
    setScreenshotMode,
    handleLayerClick,
    handlePanelSelect,
    handleBlankClick,
  };
}
