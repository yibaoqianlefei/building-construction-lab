import { useState, useEffect, useCallback, useRef } from "react";

export interface SpatialCardData {
  layer: any;
  worldPosition: number[];
  layerIndex: number;
}

export interface ModelInteractionState {
  explodeValue: number;
  autoRotate: boolean;
  isOrthographic: boolean;
  hoveredLayer: number | null;
  selectedLayer: number | null;
  screenshotMode: boolean;
  showLabels: boolean;
  syncZoom: boolean;
  viewTarget: string | null;
  spatialCard: SpatialCardData | null;
}

export function useModelInteraction(explodeAxis?: string | null) {
  /** True when interaction can be blocked (non-case node). */
  const interactionBlocked = explodeAxis != null && explodeAxis !== undefined;

  /* Refs for latest values inside stale callbacks */
  const explodeValueRef = useRef(0);
  const blockedRef = useRef(interactionBlocked);
  blockedRef.current = interactionBlocked;
  const [explodeValue, setExplodeValue] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isOrthographic, setIsOrthographic] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [syncZoom, setSyncZoom] = useState(false);
  const [viewTarget, setViewTarget] = useState<string | null>("front");
  const [spatialCard, setSpatialCard] = useState<SpatialCardData | null>(null);

  /* Keep ref in sync */
  useEffect(() => {
    explodeValueRef.current = explodeValue;
    if (explodeValue === 0) {
      setSelectedLayer(null);
    }
  }, [explodeValue]);

  /* ── Hover guard: blocked for non-case nodes when explodeValue ≤ 0 ── */
  const handleLayerHover = useCallback(
    (index: number | null) => {
      if (blockedRef.current && explodeValueRef.current <= 0) return;
      setHoveredLayer(index);
    },
    []
  );

  const handleLayerClick = useCallback(
    (index: number, _layer: any, _e: { clientX: number; clientY: number }) => {
      if (blockedRef.current && explodeValueRef.current <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
    },
    []
  );

  const handlePanelSelect = useCallback(
    (index: number) => {
      if (blockedRef.current && explodeValueRef.current <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
    },
    []
  );

  const handleBlankClick = useCallback(() => {
    /* no-op: selection persists */
  }, []);

  /* ── spatial card helpers ── */
  const handleLayerClickWithCard = useCallback(
    (index: number, layer: any, e: { clientX: number; clientY: number }, worldPos?: number[]) => {
      if (blockedRef.current && explodeValueRef.current <= 0) return;
      setSelectedLayer((prev) => (prev === index ? null : index));
      if (worldPos) {
        setSpatialCard({ layer, worldPosition: worldPos, layerIndex: index });
      }
    },
    []
  );

  const handleBlankClickWithCard = useCallback(() => {
    setSpatialCard(null);
  }, []);

  const closeSpatialCard = useCallback(() => {
    setSpatialCard(null);
  }, []);

  /* ── toggles ── */
  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((v) => !v);
  }, []);

  const toggleScreenshot = useCallback(() => {
    setScreenshotMode((v) => !v);
  }, []);

  const toggleOrthographic = useCallback(() => {
    setIsOrthographic((v) => !v);
  }, []);

  const toggleLabels = useCallback(() => {
    setShowLabels((v) => !v);
  }, []);

  const toggleSyncZoom = useCallback(() => {
    setSyncZoom((v) => !v);
  }, []);

  const toggleExplode = useCallback(() => {
    setExplodeValue((prev) => (prev < 50 ? 100 : 0));
  }, []);

  return {
    /* state */
    explodeValue,
    autoRotate,
    isOrthographic,
    hoveredLayer,
    selectedLayer,
    screenshotMode,
    showLabels,
    syncZoom,
    viewTarget,
    spatialCard,
    /* setters */
    setExplodeValue,
    setAutoRotate,
    setIsOrthographic,
    setHoveredLayer,
    setScreenshotMode,
    setShowLabels,
    setSyncZoom,
    setViewTarget,
    setSpatialCard,
    /* callbacks */
    handleLayerHover,
    handleLayerClick,
    handlePanelSelect,
    handleBlankClick,
    handleLayerClickWithCard,
    handleBlankClickWithCard,
    closeSpatialCard,
    /* toggles */
    toggleAutoRotate,
    toggleScreenshot,
    toggleOrthographic,
    toggleLabels,
    toggleSyncZoom,
    toggleExplode,
  };
}
