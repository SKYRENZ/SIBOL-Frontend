import React from "react";
import StagePopupTemplate, { StagePopupData } from "./StagePopupTemplate";

const stageImage = new URL("../../../assets/images/Stage3Drum.png", import.meta.url).href;

export const stage3Data: StagePopupData = {
  id: "stage-3",
  stageNumber: 3,
  stageName: "Anaerobic Digestion",
  operatorName: "Laurenz Listangco",
  date: "November 1, 2026",
  supportCard: {
    type: "additives",
    title: "Chemical Additives",
    items: [
      { name: "Inoculum", detail: "November 1, 2026" },
      { name: "Cow Manure", detail: "November 1, 2026" },
    ],
  },
  sensors: [
    {
      id: "ph-1",
      label: "pH Level",
      value: "7.5",
      status: "Normal",
      percent: 75,
    },
    {
      id: "ph-2",
      label: "pH Level",
      value: "7.5",
      status: "Normal",
      percent: 75,
    },
    {
      id: "ph-3",
      label: "pH Level",
      value: "7.5",
      status: "Normal",
      percent: 75,
    },
  ],
  narration:
    "Lily says: “The Stage 3 anaerobic digestion for Sibol Machine 135 is processing smoothly.”",
  selectedMachine: "Sibol Machine 135",
  stageImage,
  stageAccent: "#4F8F66",
  toggleDisplay: "0",
};

interface Stage3PopupProps {
  onMachinePickerOpen?: () => void;
  onAdditivesHistoryOpen?: () => void;
  onRefreshSensors?: () => void;
  onSensorsHistoryOpen?: () => void;
  onWasteInputHistoryOpen?: () => void;
  className?: string;
  // allow overriding sensors when used standalone
  sensors?: StagePopupData["sensors"];
}

const Stage3Popup: React.FC<Stage3PopupProps> = ({
  onMachinePickerOpen,
  onAdditivesHistoryOpen,
  onRefreshSensors,
  onSensorsHistoryOpen,
  onWasteInputHistoryOpen,
  className,
  sensors,
}) => {
  return (
    <StagePopupTemplate
      {...stage3Data}
      sensors={sensors ?? stage3Data.sensors}
      onMachinePickerOpen={onMachinePickerOpen}
      onAdditivesHistoryOpen={onAdditivesHistoryOpen}
      onRefreshSensors={onRefreshSensors}
      onSensorsHistoryOpen={onSensorsHistoryOpen}
      onWasteInputHistoryOpen={onWasteInputHistoryOpen}
      className={className}
    />
  );
};

export default Stage3Popup;
