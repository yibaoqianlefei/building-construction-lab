import { useState, useCallback } from "react";

export function usePanelState() {
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [knowledgePanelExpanded, setKnowledgePanelExpanded] = useState(-1);
  const [panelMode, setPanelMode] = useState("knowledge");

  const toggleLeftPanel = useCallback(() => setShowLeftPanel((v) => !v), []);
  const closeLeftPanel = useCallback(() => setShowLeftPanel(false), []);

  return {
    showLeftPanel,
    toggleLeftPanel,
    closeLeftPanel,
    knowledgePanelExpanded,
    setKnowledgePanelExpanded,
    panelMode,
    setPanelMode,
  };
}
