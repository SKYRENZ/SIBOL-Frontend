import React, { useEffect, useState } from "react";
import Joyride, { Step } from "react-joyride";

const WebTour: React.FC = () => {
  const [run, setRun] = useState(false);

  const steps: Step[] = [
    // Existing Dashboard Tour
    {
      target: ".tour-dashboard",
      content:
        "Welcome to your Dashboard. This page provides a real-time overview of the SIBOL system.",
      placement: "center",
    },
    {
      target: ".tour-greeting-card",
      content:
        "This greeting card displays your account identity and confirms you are logged into the system.",
    },
    {
      target: ".tour-energy-card",
      content:
        "This card shows the estimated renewable energy generated from processed food waste.",
    },
    {
      target: ".tour-foodwaste-card",
      content:
        "Here you can see the total food waste collected from households.",
    },
    {
      target: ".tour-staff-card",
      content:
        "This card shows the number of staff users in the system.",
    },
    {
      target: ".tour-additives-panel",
      content:
        "The additives panel shows the materials used for the biogas digestion process.",
    },
    {
      target: ".tour-alerts-panel",
      content:
        "This alerts panel displays system notifications such as container full warnings or sensor issues.",
    },
    {
      target: ".tour-comparison-chart",
      content:
        "This analytics chart compares food waste collected and household users over time.",
    },
  ];
   

  useEffect(() => {
    const seen = localStorage.getItem("site-tour-seen");

    if (!seen) {
      setRun(true);
      localStorage.setItem("site-tour-seen", "true");
    }

    const handler = () => {
      setRun(false);
      setTimeout(() => setRun(true), 100);
    };

    window.addEventListener("start-tour", handler);

    return () => window.removeEventListener("start-tour", handler);
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling={false}
      spotlightClicks={true}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#16a34a",
          overlayColor: "rgba(0,0,0,0.55)",
        },
        spotlight: {
          borderRadius: "14px",
          boxShadow: "0 0 0 4px rgba(22,163,74,0.45)",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "16px",
        },
      }}
    />
  );
};

export default WebTour;