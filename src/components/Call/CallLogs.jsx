import React from "react";
import { BsTelephoneFill } from "react-icons/bs";

function CallLogs() {
  return (
    <div className="flex flex-col h-full bg-search-input-container-background">
      {/* Header */}
      <div className="bg-panel-header-background h-16 flex items-center px-4">
        <span className="text-white font-medium text-lg">Calls</span>
      </div>

      {/* Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <BsTelephoneFill size={56} className="text-secondary mb-4 opacity-50" />
        <p className="text-secondary text-sm">No recent calls</p>
        <p className="text-secondary text-xs mt-1">
          Your call history will appear here
        </p>
      </div>
    </div>
  );
}

export default CallLogs;
