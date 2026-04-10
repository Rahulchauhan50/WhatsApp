import React from "react";
import Avatar from "../common/Avatar";
import { setCurrentChatUser,setConstactPage, setMessages, setUserContacts, setOnlineUser } from "@/redux/features/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { MdInsertDriveFile, MdLocationOn, MdCall, MdVideocam, MdCallMissed } from "react-icons/md";
import { GET_INITIAL_CONTACT_ROUTE } from "@/utils/ApiRoutes";

function ChatLIstItem({ socket, data, isContactpage = false,lastMessage=false, unreadMessageCount=0 }) {
  const dispatch = useDispatch();
  const { CurrentChatUser } = useSelector((state) => state.user)
  const { UserInfo } = useSelector((state) => state.user)

  const HandleContactClick = () => {
    if (data?.id !== CurrentChatUser?.id) {
      dispatch(setMessages({data:{message:[]}}))
      dispatch(setCurrentChatUser({ data }));
      socket.current.emit("send-msg-read", {to:data.id , by:UserInfo.id})
      
      if(isContactpage){
        dispatch(setConstactPage())
      }
    }
  }

  const getLastMessagePreview = () => {
    if (!lastMessage) return "";

    const prefix = lastMessage?.senderId === UserInfo?.id ? "You: " : "";

    switch (lastMessage?.type) {
      case "text":
        return prefix + lastMessage?.message;
      case "image":
        return prefix + "📷 Image";
      case "audio":
        return prefix + "🎤 Audio";
      case "document":
        const docName = lastMessage?.message?.split("/").pop()?.split(".")[0] || "Document";
        return prefix + `📄 ${docName}`;
      case "location":
        return prefix + "📍 Location";
      case "call":
        try {
          const callData = JSON.parse(lastMessage?.message);
          const isVideo = callData.callType === "video";
          const isMissed = callData.status === "missed" || callData.status === "rejected";
          const duration = callData.duration || 0;
          
          let callText = isVideo ? "Video call" : "Voice call";
          if (duration > 0) {
            const mins = Math.floor(duration / 60);
            const secs = duration % 60;
            const durStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
            callText += ` · ${durStr}`;
          } else if (isMissed) {
            callText += callData.status === "rejected" ? " (Declined)" : " (Missed)";
          }
          return {
            type: "call",
            text: callText,
            isVideo: isVideo,
            isMissed: isMissed,
            prefix: prefix
          };
        } catch {
          return { type: "call", text: "Call", isVideo: false, isMissed: false, prefix: prefix };
        }
      default:
        return prefix + lastMessage?.message || "";
    }
  };

  return <div className={`flex cursor-pointer items-center pr-2 hover:bg-background-default-hover`} onClick={HandleContactClick} >
    <div className="min-w-fit px-5 pt-3 pb-1">
      <Avatar type="lg" image={data.profileImage}  />
    </div>
    <div className="min-h-fit flex flex-col justify-center mt-3 pr-2 w-full ">
      <div className="flex justify-between ">
        <div>
          <span className="text-white">{data?.name}</span>
        </div>
        {
          !isContactpage && lastMessage && (
            <div>
              <span className={`${unreadMessageCount>0 ? "text-icon-green" : "text-secondary"} text-sm`} >
                {calculateTime(lastMessage?.createdAt)}
              </span>
            </div>
          )
        }

      </div>
      <div className="flex border-b border-conversation-border pb-2 pt-1 pr-2 " >
        <div className="flex justify-between w-full ">
          <span className="text-secondary line-clamp-1 text-sm">
            {isContactpage ? data?.about || "\u00A0":
            <div className="flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
              {
                lastMessage?.senderId === UserInfo?.id ? <MessageStatus messageStatus={lastMessage?.messageStatus}/>:""
              }
              {(() => {
                const preview = getLastMessagePreview();
                if (typeof preview === 'object' && preview.type === 'call') {
                  return (
                    <span className="flex items-center gap-0.5 truncate">
                      {preview.prefix}
                      {preview.isVideo ? (
                        <MdVideocam className={`${preview.isMissed ? "text-red-500" : "text-teal-light"}`} size={16} />
                      ) : (
                        <MdCall className={`${preview.isMissed ? "text-red-500" : "text-teal-light"}`} size={16} />
                      )}
                      <span className="truncate">{preview.text}</span>
                    </span>
                  );
                }
                return <span className="truncate">{preview}</span>;
              })()}
              </div>}
            </span>
            {
              unreadMessageCount>0 ?<span className="bg-icon-green px-[5px] rounded-full text-sm " >{unreadMessageCount}</span>:""
            }
        </div>

      </div>
    </div>

  </div>;
}

export default ChatLIstItem;