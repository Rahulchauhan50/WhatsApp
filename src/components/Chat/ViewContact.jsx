import React from "react";
import { IoClose } from "react-icons/io5";
import { MdCall, MdBlock, MdDelete, MdThumbDown } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { setContactInfo, setMessageSearch, setVoiceCall, setVideoCall } from "@/redux/features/userSlice";
import Image from "next/image";

function ViewContact() {
  const dispatch = useDispatch();
  const { CurrentChatUser, OnlineUser, ContactInfo } = useSelector((state) => state.user);

  if (!ContactInfo || !CurrentChatUser) return null;

  const isOnline = OnlineUser.includes(CurrentChatUser.id);

  const displayImage = CurrentChatUser?.profileImage || "/default_avatar.png";

  const HandleVoiceCall = () => {
    dispatch(setVoiceCall({ voiceCall: { ...CurrentChatUser, type: "out-going", callType: "voice", roomId: Date.now() } }));
  };

  const HandleVideoCall = () => {
    dispatch(setVideoCall({ videoCall: { ...CurrentChatUser, type: "out-going", callType: "video", roomId: Date.now() } }));
  };

  return (
    <div
      className={`border-conversation-border border-l md:w-full w-screen bg-conversation-panel-background flex flex-col z-10 max-h-screen h-screen md:relative absolute top-0 transition-all duration-500 ${
        ContactInfo ? "left-0" : "-left-[100vw] hidden"
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 py-5 flex gap-6 items-center bg-panel-header-background text-primary-strong shrink-0">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={() => dispatch(setContactInfo(false))}
        />
        <span className="font-medium">Contact info</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-width-0">
        {/* Profile photo + name */}
        <div className="flex flex-col items-center bg-panel-header-background pt-8 pb-6">
          <div className="h-48 w-48 rounded-full overflow-hidden mb-4">
            <Image
              src={displayImage}
              alt="contact"
              height={200}
              width={200}
              className="rounded-full bg-[#233138] object-cover"
              priority
            />
          </div>
          <h2 className="text-white text-xl font-medium">{CurrentChatUser?.name}</h2>
          <span className={`text-sm mt-1 ${isOnline ? "text-teal-light" : "text-secondary"}`}>
            {isOnline ? "online" : "offline"}
          </span>
        </div>

        {/* About */}
        <div className="bg-panel-header-background mt-2 px-8 py-4">
          <span className="text-teal-light text-sm font-medium">About</span>
          <p className="text-white text-base mt-1">
            {CurrentChatUser?.about || "Hi there! I am using WhatsApp"}
          </p>
        </div>

        {/* Email */}
        {CurrentChatUser?.email && (
          <div className="bg-panel-header-background mt-2 px-8 py-4">
            <span className="text-teal-light text-sm font-medium">Email</span>
            <p className="text-secondary text-base mt-1">{CurrentChatUser.email}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="bg-panel-header-background mt-2 flex justify-around py-4">
          <button
            onClick={HandleVoiceCall}
            className="flex flex-col items-center gap-2 text-teal-light hover:text-white transition"
          >
            <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center">
              <MdCall className="text-xl text-teal-light" />
            </div>
            <span className="text-xs text-secondary">Audio</span>
          </button>
          <button
            onClick={HandleVideoCall}
            className="flex flex-col items-center gap-2 text-teal-light hover:text-white transition"
          >
            <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center">
              <IoVideocam className="text-xl text-teal-light" />
            </div>
            <span className="text-xs text-secondary">Video</span>
          </button>
          <button
            onClick={() => {
              dispatch(setContactInfo(false));
              dispatch(setMessageSearch());
            }}
            className="flex flex-col items-center gap-2 text-teal-light hover:text-white transition"
          >
            <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center">
              <BiSearchAlt2 className="text-xl text-teal-light" />
            </div>
            <span className="text-xs text-secondary">Search</span>
          </button>
        </div>

        {/* Block & Report */}
        <div className="mt-2">
          <button className="flex items-center gap-4 w-full px-8 py-4 bg-panel-header-background hover:bg-background-default-hover transition text-red-400">
            <MdBlock className="text-xl" />
            <span className="text-base">Block {CurrentChatUser?.name}</span>
          </button>
          <button className="flex items-center gap-4 w-full px-8 py-4 bg-panel-header-background hover:bg-background-default-hover transition text-red-400 mt-[1px]">
            <MdThumbDown className="text-xl" />
            <span className="text-base">Report {CurrentChatUser?.name}</span>
          </button>
          <button className="flex items-center gap-4 w-full px-8 py-4 bg-panel-header-background hover:bg-background-default-hover transition text-red-400 mt-[1px]">
            <MdDelete className="text-xl" />
            <span className="text-base">Delete chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewContact;
