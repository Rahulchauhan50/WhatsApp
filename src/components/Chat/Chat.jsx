import React from "react";
import ChatHeader from "./ChatHeader";
import ChatContainer from "./ChatContainer";
import MessageBar from "./MessageBar";

function Chat({socket}) {
  return <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100dvh] z-10" >
    <ChatHeader socket={socket} />
    <ChatContainer socket={socket} />
    <MessageBar socket={socket}/>

  </div>;
}

export default Chat;
