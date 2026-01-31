import React from "react";
import StagePopupTemplate, { StagePopupData } from "./StagePopupTemplate";

const stageImage = new URL("../../../assets/images/Stage4Generator.png", import.meta.url).href;

export const stage4Data: StagePopupData = {
  id: "stage-4",
  stageNumber: 4,
  stageName: "Biogas Collection",
  stageSummary:
    "Processed methane is routed through the collector to stabilize flow before entering the generator stack.",
  operatorName: "Laurenz Listangco",
  date: "November 1, 2026",
  supportCard: {
    type: "gauge",
    title: "Biogas Meter Gauge",
    status: "Normal",
    percent: 80,
    valueLabel: "Stable",
  },
  sensors: [
    {
      id: "pressure",
      label: "Pressure",
      value: "80",
      status: "Normal",
      percent: 80,
    },
    {
      id: "flow-rate",
      label: "Flow Rate",
      value: "72",
      status: "Normal",
      percent: 72,
    },
  ],
  narration:
    "Lily says: “The Stage 4 biogas collection for Sibol Machine 145 is holding steady.”",
  selectedMachine: "Sibol Machine 145",
  stageImage,
  stageAccent: "#4B9B6B",
  toggleDisplay: "0",
};

const Stage4Popup: React.FC = () => {
  return <StagePopupTemplate {...stage4Data} />;
};

export default Stage4Popup;
