import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { TbCircleDashed } from "react-icons/tb";

function StatusList() {
  const { UserInfo } = useSelector((state) => state.user);

  return (
    <div className="flex flex-col h-full bg-search-input-container-background">
      {/* Header */}
      <div className="bg-panel-header-background h-16 flex items-center px-4">
        <span className="text-white font-medium text-lg">Status</span>
      </div>

      {/* My Status */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-background-default-hover cursor-pointer">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={UserInfo?.profileImage || UserInfo?.profileImageTemp || "/default_avatar.png"}
              alt="My status"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-icon-green rounded-full w-5 h-5 flex items-center justify-center border-2 border-search-input-container-background">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-medium">My status</p>
          <p className="text-secondary text-xs">Tap to add status update</p>
        </div>
      </div>

      <div className="border-t border-conversation-border" />

      {/* Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <TbCircleDashed size={64} className="text-secondary mb-4 opacity-50" />
        <p className="text-secondary text-sm">No recent status updates</p>
        <p className="text-secondary text-xs mt-1">
          Status updates from your contacts will appear here
        </p>
      </div>
    </div>
  );
}

export default StatusList;
