import React from "react";
import { useSelector } from "react-redux";
import { MdCall, MdCallMade, MdCallReceived, MdCallMissed, MdVideocam } from "react-icons/md";
import MessageStatus from "../common/MessageStatus";

function CallMessage({ message }) {
  const { CurrentChatUser, UserInfo } = useSelector((state) => state.user);

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return dateObject.toLocaleString("en-US", options);
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  let callData = {};
  try {
    callData = JSON.parse(message.message);
  } catch {
    callData = { callType: "voice", duration: 0, status: "missed" };
  }

  const isOutgoing = message.senderId === UserInfo?.id;
  const isMissed = callData.status === "missed" || callData.status === "rejected";
  const isVideo = callData.callType === "video";

  const getCallIcon = () => {
    if (isMissed) return <MdCallMissed className="text-red-500" size={18} />;
    if (isOutgoing) return <MdCallMade className="text-green-500" size={18} />;
    return <MdCallReceived className="text-green-500" size={18} />;
  };

  const getCallLabel = () => {
    const type = isVideo ? "Video call" : "Voice call";
    if (isMissed) {
      return isOutgoing ? `${type} - No answer` : `Missed ${type.toLowerCase()}`;
    }
    const dur = formatDuration(callData.duration);
    return dur ? `${type} · ${dur}` : type;
  };

  return (
    <div
      className={`flex max-w-full w-[300px] ${
        message.senderId === CurrentChatUser?.id ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`px-3 py-2 rounded-md flex items-center gap-3 max-w-[90%] ${
          message.senderId === CurrentChatUser?.id
            ? "bg-incoming-background"
            : "bg-outgoing-background"
        }`}
      >
        <div className={`p-2 rounded-full ${isMissed ? "bg-red-500/10" : "bg-green-500/10"}`}>
          {isVideo ? <MdVideocam className={isMissed ? "text-red-500" : "text-green-500"} size={20} /> : <MdCall className={isMissed ? "text-red-500" : "text-green-500"} size={20} />}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-white text-sm">
            {getCallIcon()}
            <span>{getCallLabel()}</span>
          </div>
        </div>
        <div className="flex gap-1 items-end ml-2">
          <span className="text-bubble-meta text-[11px] pt-1">{getTime(message.createdAt)}</span>
          <span>
            {message.senderId === UserInfo?.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CallMessage;
