import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiInfo } from "react-icons/fi";
import { Image } from "lucide-react";
import { useGLTF } from "@react-three/drei";
import { assetPath } from "./utils/baseUrl";
import ModelViewer from "./components/viewer/ModelViewer";
import BottomControlBar from "./components/viewer/BottomControlBar";
import ViewGizmo from "./components/viewer/ViewGizmo";
import ConstructionKnowledgePanel from "./components/viewer/ConstructionKnowledgePanel";
import ScreenshotTool from "./components/viewer/ScreenshotTool";
import ZoomableImage from "./components/viewer/ZoomableImage";
import ModelViewerSkeleton from "./components/viewer/ModelViewerSkeleton";
import ModelErrorBoundary from "./components/viewer/ModelErrorBoundary";
import { saveNote } from "./services/noteService";
import { getNodeData } from "./data/nodesIndex";
import { useModelInteraction } from "./hooks/useModelInteraction";
import { getNodeDefinition } from "./services/contentService";
import type { NodeData } from "./types";

const ACCENT = "#cc785c";

function NodeDetail() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [data, setData] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    explodeValue,
    setExplodeValue,
    autoRotate,
    setAutoRotate,
    isOrthographic,
    setIsOrthographic,
    hoveredLayer,
    setHoveredLayer,
    selectedLayer,
    screenshotMode,
    setScreenshotMode,
    handleLayerClick,
    handlePanelSelect,
    handleBlankClick,
  } = useModelInteraction();

  const [showLabels, setShowLabels] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [syncZoom, setSyncZoom] = useState(false);
  const [diagramScale, setDiagramScale] = useState(1);
  const [panOffset, setPanOffset] = useState<{x:number,y:number,w:number,h:number,scale:number}|null>(null);
  const [viewTarget, setViewTarget] = useState<string | null>("front");
  const [spatialCard, setSpatialCard] = useState<{
    layer: any; worldPosition: number[]; layerIndex: number;
  } | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null!);
  const controlsRef = useRef<any>(null);

  /* ── load node data ── */
  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    setData(null);
    setImageError(false);
    getNodeDefinition(nodeId)
      .then((row: any) => {
        if (row?.node_data) return row.node_data;
        return getNodeData(nodeId);
      })
      .then(setData)
      .finally(() => setLoading(false));
  }, [nodeId]);

  /* ── preload GLB models ── */
  useEffect(() => {
    if (!data?.layers) return;
    data.layers.forEach((layer: any) => {
      if (layer.modelPath) {
        useGLTF.preload(assetPath(layer.modelPath), true);
      }
    });
  }, [data]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !screenshotMode;
    }
  }, [screenshotMode]);

  /* ── keyboard shortcuts ── */
  const toggleExplode = useCallback(() => {
    if (data?.explodeAxis == null) return;
    setExplodeValue((prev) => (prev < 50 ? 100 : 0));
  }, [data?.explodeAxis, setExplodeValue]);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((v) => !v);
  }, [setAutoRotate]);

  const toggleLabels = useCallback(() => {
    if (data?.explodeAxis == null) return;
    setShowLabels((v) => !v);
  }, [data?.explodeAxis]);

  const toggleScreenshot = useCallback(() => {
    setScreenshotMode((v) => !v);
  }, [setScreenshotMode]);

  const toggleOrthographic = useCallback(() => {
    setIsOrthographic((v) => !v);
  }, [setIsOrthographic]);

  const handleLayerClickWithCard = useCallback(
    (index: number, layer: any, e: any, worldPos?: number[]) => {
      handleLayerClick(index, layer, e);
      if (worldPos) {
        setSpatialCard({ layer, worldPosition: worldPos, layerIndex: index });
      }
    },
    [handleLayerClick]
  );

  const handleBlankClickWithCard = useCallback(() => {
    handleBlankClick();
    setSpatialCard(null);
  }, [handleBlankClick]);

  const handleSpatialCardClose = useCallback(() => {
    setSpatialCard(null);
  }, []);

  const clearSelection = useCallback(() => {
    handleBlankClickWithCard();
  }, [handleBlankClickWithCard]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        toggleExplode();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        toggleAutoRotate();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        toggleLabels();
      } else if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        toggleOrthographic();
      } else if (e.key === "Escape") {
        clearSelection();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        toggleScreenshot();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleExplode, toggleAutoRotate, toggleLabels, clearSelection, toggleScreenshot, toggleOrthographic]);

  /* ── hotspot click → select layer ── */
  const handleHotspotClick = useCallback(
    (layerIndex: number) => {
      if (data?.explodeAxis == null) return;
      if (explodeValue <= 0) setExplodeValue(80);
      setTimeout(() => handlePanelSelect(layerIndex), 50);
    },
    [data?.explodeAxis, explodeValue, setExplodeValue, handlePanelSelect]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-body flex flex-col h-screen">
        <div className="px-6 md:px-10 py-2.5 bg-canvas border-b border-hairline flex-shrink-0">
          <span className="text-sm text-muted-soft">加载中…</span>
        </div>
        <main className="flex-1 flex flex-col lg:flex-row min-h-0">
          <aside className="hidden lg:flex flex-[2] bg-canvas border-r border-hairline flex-col items-center justify-center rounded-r-2xl m-4 mr-0 p-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </aside>
          <ModelViewerSkeleton />
          <aside className="w-full lg:w-[360px] flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-hairline bg-canvas overflow-y-auto">
            <div className="p-4 md:p-5 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          </aside>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">未找到该构造节点</p>
        </div>
      </div>
    );
  }

  const hasImage = data.diagramImage && !imageError;
  const hasHotspots = data.diagramHotspots && data.diagramHotspots.length > 0;

  return (
    <div className="min-h-screen bg-canvas text-body flex flex-col h-screen">
      <div className="px-6 md:px-10 py-2.5 bg-canvas border-b border-hairline flex-shrink-0">
        <span className="text-sm text-muted-soft">
          <Link to="/library" className="text-primary hover:text-primary-active transition-colors">节点库</Link>
          <span className="mx-1.5 text-muted-soft">›</span>
          <span className="text-muted">{data.title}</span>
        </span>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {hasImage ? (
          <aside className="hidden lg:flex flex-[2] bg-canvas border-r border-hairline rounded-r-2xl m-4 mr-0 overflow-hidden p-8">
            <ZoomableImage
              src={data.diagramImage!}
              alt={`${data.title} 剖面图`}
              onError={() => setImageError(true)}
              hotspots={hasHotspots ? data.diagramHotspots! : null}
              onHotspotClick={handleHotspotClick}
              onScaleChange={setDiagramScale}
              onPositionChange={(pos, size) => setPanOffset({x:pos.x, y:pos.y, w:size.width, h:size.height, scale: diagramScale})}
            />
          </aside>
        ) : (
          <aside className="hidden lg:flex flex-[2] bg-canvas border-r border-hairline flex-col items-center justify-center rounded-r-2xl m-4 mr-0 p-8">
            <Image size={40} className="text-muted-soft mb-3" strokeWidth={1} />
            <p className="text-sm text-muted font-light">剖面图</p>
            <p className="text-xs text-muted-soft mt-1">即将上线</p>
          </aside>
        )}

        <div className="flex-[3] flex flex-col min-h-0 relative">
          <ModelErrorBoundary key={nodeId}>
            <motion.div
              ref={viewerRef}
              className="flex-1 relative rounded-2xl overflow-hidden border border-hairline bg-canvas m-4 md:m-6 md:mx-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ModelViewer
                layers={data.layers}
                explodeValue={explodeValue}
                explodeAxis={data.explodeAxis}
                floatDirection={data.floatDirection}
                floatDistance={data.floatDistance}
                modelRotation={data.modelRotation || [0, 0, 0]}
                nodeTitle={data.title}
                layerOrderReverse={data.layerOrderReverse || false}
                cameraPosition={data.cameraPosition || [0, 1.2, 4.0]}
                autoRotate={autoRotate}
                hoveredLayer={hoveredLayer}
                selectedLayer={selectedLayer}
                onHoverLayer={setHoveredLayer}
                onLayerClick={handleLayerClickWithCard}
                onBlankClick={handleBlankClickWithCard}
                spatialCard={spatialCard}
                onSpatialCardClose={handleSpatialCardClose}
                showLabels={showLabels}
                onControlsReady={(ctrl: any) => { controlsRef.current = ctrl; }}
                syncScale={syncZoom ? diagramScale : undefined}
                panOffset={syncZoom && explodeValue === 0 ? panOffset : null}
                viewTarget={viewTarget}
                onViewDone={() => setViewTarget(null)}
                isOrthographic={isOrthographic}
              />

              {/* Blender-style view gizmo — top-right overlay */}
              <ViewGizmo viewTarget={viewTarget} onViewChange={setViewTarget} />

              <BottomControlBar
                explodeValue={explodeValue}
                onExplodeChange={setExplodeValue}
                onExplodeReset={() => setExplodeValue(0)}
                onExplodeMax={() => setExplodeValue(100)}
                autoRotate={autoRotate}
                onAutoRotateToggle={() => setAutoRotate((v) => !v)}
                screenshotActive={screenshotMode}
                onScreenshotToggle={() => setScreenshotMode((v) => !v)}
                showLabels={showLabels}
                onLabelsToggle={() => setShowLabels((v) => !v)}
                explodeAxis={data.explodeAxis}
                syncZoom={syncZoom}
                onSyncZoomToggle={() => setSyncZoom((v) => !v)}
                isOrthographic={isOrthographic}
                onOrthographicToggle={toggleOrthographic}
              />

              {screenshotMode && (
                <ScreenshotTool
                  containerRef={viewerRef}
                  onScreenshot={(dataUrl) => {
                    saveNote({
                      nodeId: data.id,
                      nodeTitle: data.title,
                      image: dataUrl,
                    });
                  }}
                  onClose={() => setScreenshotMode(false)}
                />
              )}
            </motion.div>
          </ModelErrorBoundary>
        </div>

        <aside className="w-full lg:w-[360px] flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-hairline bg-canvas overflow-y-auto">
          <motion.div
            className="p-4 md:p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <div className="bg-canvas rounded-xl p-4 border border-hairline mb-4">
              <h2 className="text-ink font-medium text-base flex items-center gap-2 mb-2 tracking-tight">
                <FiInfo style={{ color: ACCENT }} />
                {data.title}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {data.description}
              </p>
              {data.directionLabel && (
                <p className="text-muted-soft text-xs mt-2">
                  方向：{data.directionLabel}
                </p>
              )}
            </div>
          </motion.div>

          <ConstructionKnowledgePanel
            layers={data.layers}
            activeLayer={selectedLayer}
            onLayerSelect={handlePanelSelect}
            nodeId={data.id}
          />
        </aside>
      </main>
    </div>
  );
}

export default NodeDetail;
