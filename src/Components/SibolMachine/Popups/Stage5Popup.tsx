import React from "react";
import StagePopupTemplate, { StagePopupData } from "./StagePopupTemplate";

const stageImage = new URL("../../../assets/images/Stage5PS.png", import.meta.url).href;

export const stage5Data: StagePopupData = {
  id: "stage-5",
  stageNumber: 5,
  stageName: "Electricity Conversion",
  stageSummary:
    "Generated biogas feeds the converter to deliver consistent electricity output while storage buffers absorb demand swings.",
  operatorName: "Laurenz Listangco",
  date: "November 1, 2026",
  supportCard: {
    type: "counter",
    title: "Total kWh Collected",
    caption: "Lifetime output",
    value: "005555",
  },
  sensors: [
    {
      id: "converter-efficiency",
      label: "Converter Efficiency",
      value: "86",
      status: "Normal",
      percent: 86,
    },
    {
      id: "stored-power",
      label: "Stored Power",
      value: "78",
      status: "Normal",
      percent: 78,
    },
    {
      id: "uptime",
      label: "Uptime",
      value: "99",
      status: "Normal",
      percent: 99,
    },
  ],
  narration:
    "Lily says: “Electricity conversion for Sibol Machine 156 is steady—reserve banks are ready for the next demand spike.”",
  selectedMachine: "Sibol Machine 156",
  stageImage,
  stageAccent: "#3F8E63",
  toggleDisplay: "0",
};

const Stage5Popup: React.FC = () => {
  return <StagePopupTemplate {...stage5Data} />;
};

export default Stage5Popup;
