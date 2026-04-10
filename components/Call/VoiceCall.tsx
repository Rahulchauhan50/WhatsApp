import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
const Container = dynamic(()=> import("./Container"),{ssr:false})

type VoiceCallProps = {
  socket: any;
};

function VoiceCall({ socket }: VoiceCallProps) {
  const {UserInfo, voiceCall } = useSelector((state: any) => state.user);

  useEffect(()=>{
    if(voiceCall.type==="out-going"){
      socket.current.emit("outgoing-voice-call",{
        to:voiceCall.id,
        from:UserInfo,
        callType:voiceCall.callType,
        roomId:voiceCall.roomId
      })
    }
  },[voiceCall])

  return <Container data={voiceCall} socket={socket} />
}

export default VoiceCall;
