import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "@/redux/features/userSlice";
import { BsChatDotsFill, BsTelephoneFill } from "react-icons/bs";
import { TbCircleDashed } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";

const tabs = [
  { id: "chats", label: "Chats", icon: BsChatDotsFill },
  { id: "status", label: "Status", icon: TbCircleDashed },
  { id: "calls", label: "Calls", icon: BsTelephoneFill },
  { id: "profile", label: "Profile", icon: CgProfile },
];

function BottomNav() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.user);

  return (
    <nav className="flex items-center justify-around bg-panel-header-background border-t border-conversation-border h-14 flex-shrink-0">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => dispatch(setActiveTab(id))}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              active ? "text-icon-green" : "text-panel-header-icon"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
