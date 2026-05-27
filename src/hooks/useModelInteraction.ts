import { useState, useEffect, useCallback } from "react";
import type { ActiveCard } from "../types";

export function useModelInteraction() {
  const [explodeValue, setExplodeValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);

  useEffect(() => {
    if (explodeValue === 0) {
      setSelectedLayer(null);
      setActiveCard(null);
    }
  }, [explodeValue]);

  const handleLayerClick = useCallback(
    (index: number, layer: any, e: { clientX: number; clientY: number }) => {
      if (explodeValue <= 0) return;
      if (selectedLayer === index) {
        setSelectedLayer(null);
        setActiveCard(null);
      } else {
        setSelectedLayer(index);
        setActiveCard({ layer, x: e.clientX, y: e.clientY });
      }
    },
    [explodeValue, selectedLayer]
  );

  const handlePanelSelect = useCallback(
    (index: number) => {
      if (explodeValue <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
    },
    [explodeValue]
  );

  const handleBlankClick = useCallback(() => {
    setActiveCard(null);
  }, []);

  return {
    explodeValue,
    setExplodeValue,
    autoRotate,
    setAutoRotate,
    hoveredLayer,
    setHoveredLayer,
    selectedLayer,
    activeCard,
    setActiveCard,
    screenshotMode,
    setScreenshotMode,
    handleLayerClick,
    handlePanelSelect,
    handleBlankClick,
  };
}
