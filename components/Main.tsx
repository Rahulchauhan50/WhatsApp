import React, { useEffect, useRef } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import Chat from "./Chat/Chat";
import { useSelector } from "react-redux";
import axios from "axios";
import { GET_INITIAL_CONTACT_ROUTE, GET_MESSAGE_ROUTE, HOST } from "@/utils/ApiRoutes";
import { setMessages, setOnlineUser, setUserContacts, setRead, addOlderMessages, setLoadingOlderMessages } from "@/redux/features/userSlice";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import {EndCall, setSocket, setAddMessages, setIncomingVoiceCall, setIncomingVideoCall } from "@/redux/features/userSlice";
import { useState } from "react";
import SearchMessages from "./Chat/SearchMessages";
import ViewContact from "./Chat/ViewContact";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";
import SideNav from "./common/SideNav";

function Main() {
  const {
    MessageSearch,
    ContactInfo,
    UserInfo,
    videoCall,
    voiceCall,
    incomingVideoCall,
    incomingVoiceCall,
    Messages
  } = useSelector((state) => state.user);
  const {CurrentChatUser} = useSelector((state)=>state.user)
  const [socketEvent, setsocketEvent] = useState(false);
  const dispatch = useDispatch();
  const socket = useRef();

  useEffect(() => {
    if (UserInfo?.id) {
      socket.current = io(HOST);
      
      // Listen for socket connection
      socket.current.on("connect", () => {
        dispatch(setSocket({ socketId: socket.current.id }));
        socket.current.emit("add-user", UserInfo?.id);
        setsocketEvent(true);
      });
  
      // Listen for socket disconnection
      socket.current.on("disconnect", () => {
        setsocketEvent(false);
      });
  
      // Cleanup on component unmount
      return () => {
        socket.current.disconnect();
      };
    }
  }, [UserInfo?.id, dispatch]);

  const getContacts = async () =>{

    try {
      const {data:{users,onlineUsers}} = await axios.get(`${GET_INITIAL_CONTACT_ROUTE}/${UserInfo?.id}`)
      dispatch(setUserContacts({userContacts:users}));
      dispatch(setOnlineUser({onlineUsers}));
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    if(socket.current){
      // Remove old listeners first
      socket.current.off("msg-recieve");
      socket.current.off("incoming-voice-call");
      socket.current.off("incoming-video-call");
      socket.current.off("voice-call-rejected");
      socket.current.off("video-call-rejected");
      socket.current.off("online-users");

      // Register new listeners
      socket.current.on("msg-recieve", (data) => {
        if(CurrentChatUser !== undefined && CurrentChatUser.id === data.senderId){
          dispatch(setAddMessages(data));
        }
        getContacts();
      });
   
      socket.current.on("incoming-voice-call", ({from,roomId,callType}) => {
        dispatch(setIncomingVoiceCall({incomingVoiceCall:{...from,roomId,callType}}));
      });

      socket.current.on("incoming-video-call", ({from,roomId,callType}) => {
        dispatch(setIncomingVideoCall({incomingVideoCall:{...from,roomId,callType}}));
      });

      socket.current.on("voice-call-rejected", () => {
        dispatch(EndCall())
      });

      socket.current.on("video-call-rejected", () => {
        dispatch(EndCall())
      });

      socket.current.on("online-users",({onlineUsers})=>{
        dispatch(setOnlineUser({onlineUsers}))
      });

      // Cleanup function
      return () => {
        socket.current?.off("msg-recieve");
        socket.current?.off("incoming-voice-call");
        socket.current?.off("incoming-video-call");
        socket.current?.off("voice-call-rejected");
        socket.current?.off("video-call-rejected");
        socket.current?.off("online-users");
      };
    }
  }, [CurrentChatUser, socketEvent, dispatch]);


  useEffect(() => {
    const getMessages = async () => {
      try {
        const { data } = await axios.get(
          `${GET_MESSAGE_ROUTE}/${UserInfo.id}/${CurrentChatUser.id}?skip=0&limit=50`
        );
        const {data:{users,onlineUsers}} = await axios.get(`${GET_INITIAL_CONTACT_ROUTE}/${UserInfo?.id}`)
        dispatch(setUserContacts({userContacts:users}));
        dispatch(setOnlineUser({onlineUsers}));
        dispatch(setMessages({ data }));
      } catch (error) {
        console.log(error);
      }
      
      // Notify the sender that messages have been read
      if(socket.current) {
        socket.current.emit("send-msg-read", {
          to: CurrentChatUser.id,
          by: UserInfo.id
        });
      }
    };

    if (UserInfo?.id && CurrentChatUser?.id) {
      getMessages();
    }
  }, [CurrentChatUser, dispatch, UserInfo]);
  return (
    <>
    {
      incomingVideoCall && <IncomingVideoCall socket={socket} />
    }
    {
      incomingVoiceCall && <IncomingCall socket={socket} />
    }
      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall socket={socket} />
        </div>
      )}
      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall socket={socket} />
        </div>
      )}
      {!videoCall && !voiceCall && (
        <div className="flex h-[100dvh] w-screen max-h-[100dvh] max-w-full">
          <SideNav />
          <div className="grid md:grid-cols-main flex-1 min-w-0">
          <ChatList socket={socket} />
          {CurrentChatUser ? (
            <div
            className={`${
              MessageSearch || ContactInfo ? "md:grid md:grid-cols-2 md:w-auto w-screen" : "grid-cols-2"
            } h-[100dvh] overflow-hidden`}
            >
              <Chat socket={socket} />
              { <SearchMessages />}
              { <ViewContact />}
            </div>
          ) : (
            <Empty />
          )}
          </div>
        </div>
      )}
    </>
  );
}

export default Main;
