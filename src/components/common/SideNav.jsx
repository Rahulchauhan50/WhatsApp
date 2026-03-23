import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "@/redux/features/userSlice";
import { BsChatDotsFill, BsTelephoneFill } from "react-icons/bs";
import { TbCircleDashed } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";

const tabs = [
  { id: "chats", icon: BsChatDotsFill, label: "Chats" },
  { id: "status", icon: TbCircleDashed, label: "Status" },
  { id: "calls", icon: BsTelephoneFill, label: "Calls" },
  { id: "profile", icon: CgProfile, label: "Profile" },
];

function SideNav() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.user);

  return (
    <nav className="hidden md:flex flex-col items-center bg-[#1f2c34] border-r border-conversation-border w-[68px] py-3 gap-1 flex-shrink-0">
      {tabs.map(({ id, icon: Icon, label }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => dispatch(setActiveTab(id))}
            title={label}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              active
                ? "bg-background-default-hover text-icon-green"
                : "text-panel-header-icon hover:bg-background-default-hover"
            }`}
          >
            <Icon size={22} />
          </button>
        );
      })}
    </nav>
  );
}

export default SideNav;
