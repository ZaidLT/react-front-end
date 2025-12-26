import React, { useEffect, useRef } from "react";

interface IProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<IProgressBarProps> = ({
  currentStep,
  totalSteps
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progress = (currentStep / totalSteps) * 100;
  
  useEffect(() => {
    if (progressBarRef.current) {
      // Animate the width change
      progressBarRef.current.style.transition = 'width 500ms ease';
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [currentStep, progress]);

  return (
    <div 
      style={{
        height: "10px",
        width: "310px",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#333E73",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "4px",
          position: "relative",
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "0%", // Initial width before animation
            borderRadius: "4px",
            maxWidth: "100%",
            background: "linear-gradient(to right, #6FF9D8, #C3B7FF)",
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
