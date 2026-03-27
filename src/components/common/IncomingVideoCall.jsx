import { EndCall, setIncomingVideoCall, setVideoCall, setAddMessages } from "@/redux/features/userSlice";
import Image from "next/image";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoVideocam, IoChevronUp } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import axios from "axios";
import { ADD_CALL_MESSAGE_ROUTE } from "@/utils/ApiRoutes";

function IncomingVideoCall({ socket }) {
  const { incomingVideoCall, UserInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const acceptCall = () => {
    dispatch(setVideoCall({ videoCall: { ...incomingVideoCall, type: "in-coming" } }));
    socket.current.emit("accept-incoming-call", { id: incomingVideoCall.id });
    dispatch(setIncomingVideoCall({ incomingVideoCall: undefined }));
  };

  const rejectCall = async () => {
    try {
      const { data: response } = await axios.post(ADD_CALL_MESSAGE_ROUTE, {
        from: incomingVideoCall.id,
        to: UserInfo.id,
        callType: "video",
        duration: 0,
        status: "rejected",
      });
      
      const callMsg = response.message;
      
      // Immediately add message to receiver's chat
      dispatch(
        setAddMessages({
          id: callMsg.id,
          message: callMsg.message,
          senderId: callMsg.senderId,
          recieverId: callMsg.recieverId,
          type: "call",
          createdAt: callMsg.createdAt,
          messageStatus: "read",
        })
      );
      
      // Emit socket event to notify the caller with full message data
      socket.current.emit("send-msg", {
        id: callMsg.id,
        message: callMsg.message,
        senderId: callMsg.senderId,
        recieverId: callMsg.recieverId,
        type: "call",
        createdAt: callMsg.createdAt,
        messageStatus: "read",
      });
    } catch (err) {
      console.error("Failed to save rejected call:", err);
    }
    dispatch(EndCall());
    socket.current.emit("reject-video-call", { from: incomingVideoCall.id });
  };

  const ignoreCall = () => {
    dispatch(setIncomingVideoCall({ incomingVideoCall: undefined }));
  };

  return (
    <>
      {/* Mobile: fullscreen */}
      <div className="md:hidden fixed inset-0 z-50 bg-[#0b141a] flex flex-col items-center text-white">
        <div className="flex flex-col items-center mt-20 gap-2">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teal-light">
            <Image
              src={incomingVideoCall.profileImage || "/default_avatar.png"}
              alt={incomingVideoCall.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-light mt-4">{incomingVideoCall.name}</h2>
          <p className="text-sm text-gray-400">Incoming video call</p>
        </div>

        <div className="flex items-center justify-around w-full max-w-xs mt-auto mb-16">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <MdCallEnd size={30} className="text-white" />
            </button>
            <span className="text-xs text-gray-400">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={ignoreCall}
              className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <IoChevronUp size={30} className="text-white" />
            </button>
            <span className="text-xs text-gray-400">Ignore</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <IoVideocam size={30} className="text-white" />
            </button>
            <span className="text-xs text-gray-400">Accept</span>
          </div>
        </div>
      </div>

      {/* Desktop: floating card */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-[#1f2c34] text-white shadow-2xl border border-[#2a3942] overflow-hidden">
        <div className="flex items-center gap-4 p-4 w-full">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={incomingVideoCall.profileImage || "/default_avatar.png"}
              alt={incomingVideoCall.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{incomingVideoCall.name}</p>
            <p className="text-xs text-gray-400">Incoming video call</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={rejectCall}
                className="flex-1 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-xs font-medium transition-colors"
              >
                Decline
              </button>
              <button
                onClick={ignoreCall}
                className="flex-1 py-1.5 rounded-full bg-gray-600 hover:bg-gray-700 text-xs font-medium transition-colors"
              >
                Ignore
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-xs font-medium transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncomingVideoCall;
