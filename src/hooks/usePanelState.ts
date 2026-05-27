import { useState } from "react";

export function usePanelState() {
  const [knowledgePanelExpanded, setKnowledgePanelExpanded] = useState(-1);
  const [panelMode, setPanelMode] = useState("knowledge");

  return {
    knowledgePanelExpanded,
    setKnowledgePanelExpanded,
    panelMode,
    setPanelMode,
  };
}
