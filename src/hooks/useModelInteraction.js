import { useState, useEffect, useCallback } from "react";

export function useModelInteraction() {
  const [explodeValue, setExplodeValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState(false);

  useEffect(() => {
    if (explodeValue === 0) {
      setSelectedLayer(null);
      setActiveCard(null);
    }
  }, [explodeValue]);

  const handleLayerClick = useCallback(
    (index, layer, e) => {
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
    (index) => {
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
