import React from "react";
import ChatListHeader from "./ChatListHeader";
import SearchBar from "./SearchBar";
import List from "./List";
import { useSelector } from "react-redux";
import { useEffect } from 'react';
import ContactsList from "./ContactsList";
import Profile from "../Profile/Profile";
import BottomNav from "../common/BottomNav";
import StatusList from "../Status/StatusList";
import CallLogs from "../Call/CallLogs";

function ChatList({socket}) {
  const { ConstactPage, CurrentChatUser, ProfilePage, activeTab } = useSelector((state) => state.user);

  useEffect(()=>{
  },[ConstactPage])

  const renderTabContent = () => {
    if (activeTab === "profile" || ProfilePage) {
      return <Profile />;
    }
    if (activeTab === "status") {
      return <StatusList />;
    }
    if (activeTab === "calls") {
      return <CallLogs />;
    }
    // Default: chats tab
    if (ConstactPage) {
      return <ContactsList socket={socket} />;
    }
    return <><ChatListHeader socket={socket} /><SearchBar /><List socket={socket} /></>;
  };

  return (
    <div className={`${CurrentChatUser ? "hidden md:flex" : "flex"} bg-panel-header-background flex-col h-[100dvh] md:max-h-[100dvh] z-20`}>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderTabContent()}
      </div>
      {/* Mobile bottom nav - hidden when chat is open */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default ChatList;
