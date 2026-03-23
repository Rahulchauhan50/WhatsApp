import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import DocumentMessage from "./DocumentMessage";
import LocationMessage from "./LocationMessage";
import dynamic from "next/dynamic";
import { setMessages, setRead, addOlderMessages, setLoadingOlderMessages } from "@/redux/features/userSlice";
import axios from "axios";
import { GET_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
const VoiceMessage = dynamic(()=>import("./VoiceMessage"),{
  ssr:false
}) 


function ChatContainer({socket}) {
  const { Messages, CurrentChatUser, UserInfo, pagination, isLoadingOlderMessages } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const containerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [scrollDebounce, setScrollDebounce] = useState(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = dateObject.toLocaleString('en-US', options);
    return formattedTime.toString()
  }

  // Auto-scroll on initial load and when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [Messages, CurrentChatUser?.id])

  // Handle scroll event to fetch older messages
  const handleScroll = (e) => {
    const element = e.target
    
    // Check if scrolled to top
    if(element.scrollTop === 0 && !isLoadingOlderMessages && pagination?.hasMore) {
      setIsScrollingUp(true)
      fetchOlderMessages()
    }
    
    // Debounce scroll end detection
    clearTimeout(scrollDebounce)
    setScrollDebounce(setTimeout(() => {
      setIsScrollingUp(false)
    }, 500))
  }

  const fetchOlderMessages = async () => {
    if(!UserInfo?.id || !CurrentChatUser?.id) return
    if(isLoadingOlderMessages || !pagination?.hasMore) return

    try {
      dispatch(setLoadingOlderMessages(true))
      const newSkip = pagination.skip + pagination.limit
      const { data } = await axios.get(
        `${GET_MESSAGE_ROUTE}/${UserInfo.id}/${CurrentChatUser.id}?skip=${newSkip}&limit=${pagination.limit}`
      )
      dispatch(addOlderMessages({ data }))
    } catch (error) {
      console.log("Error fetching older messages:", error)
    } finally {
      dispatch(setLoadingOlderMessages(false))
    }
  }
  
  useEffect(()=>{
    if(socket?.current) {
      socket.current.off("msg-read");
      socket.current.on("msg-read", (data) => {
        // data contains { readBy: userId } - the user who marked messages as read
        dispatch(setRead({ readBy: data?.readBy }));
      });
    }
    return () => {
      socket?.current?.off("msg-read");
    }
  },[Messages, dispatch, CurrentChatUser?.id])


  return <div 
    ref={containerRef}
    className="relative flex-grow overflow-auto custom-scrollbar-width-0"
    onScroll={handleScroll}
  >
    <div
      className="bg-chat-background opacity-5 w-full fixed top-0 right-0 bottom-0 left-0 z-0 pointer-events-none"
    ></div>

    {/* Loading indicator */}
    {isLoadingOlderMessages && (
      <div className="flex justify-center py-4 text-gray-400 text-sm">
        <span>Loading older messages...</span>
      </div>
    )}

    {/* Messages Container */}
    <div className="bg-fixed w-full relative left-0 top-0 z-0">
      <div className="lg:mx-10 mx-4 my-4 relative bottom-0 z-40 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-2">
            {
              Object.entries(Messages || {}).map(([date, messageList])=>{
                return (
                  <div key={date} className="flex flex-col justify-end w-full gap-2 md:mb-2 mb-4" >
                  <div className="text-secondary flex justify-center pl-10 py-5">
                    <span className="text-[0.700rem] bg-incoming-background bottom-1 rounded-sm p-2" >{date}</span>
                  </div>
                  {messageList?.map((msg, index ) => (
              <div key={index} className={`flex max-w-full ${msg.senderId === CurrentChatUser?.id ? "justify-start left" : "justify-end right"}`}>
                {msg.type === "text" && (
                  <div className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[90%] ${msg.senderId === CurrentChatUser?.id ? "bg-incoming-background" : "bg-outgoing-background"}`}>
                    <p>{msg.message}</p>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta truncate text-[11px] pt-1">{getTime(msg.createdAt)}</span>
                      <span>{msg.senderId === UserInfo.id && <MessageStatus messageStatus={msg.messageStatus} />}</span>
                    </div>
                  </div>
                )}
                {msg.type === "image" && <ImageMessage message={msg} />}
                {msg.type === "audio" && <VoiceMessage message={msg} />}
                {msg.type === "document" && <DocumentMessage message={{ ...msg, currentUserId: UserInfo.id }} />}
                {msg.type === "location" && <LocationMessage message={{ ...msg, currentUserId: UserInfo.id }} />}
              </div>
            ))}
                  </div>
                  )
              })
            }
          
           <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default ChatContainer;


