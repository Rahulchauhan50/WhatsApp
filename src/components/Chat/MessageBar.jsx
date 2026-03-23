import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE, GET_INITIAL_CONTACT_ROUTE, ADD_DOCUMENT_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend, MdCameraAlt, MdLocationOn, MdInsertDriveFile, MdImage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setAddMessages, setOnlineUser, setUserContacts } from "@/redux/features/userSlice";
import EmojiPicker from "emoji-picker-react";
import PhotoPicker from "../common/PhotoPicker";
import { FaMicrophone } from "react-icons/fa";
import dynamic from "next/dynamic";
const CaptureAudio = dynamic(()=> import("../common/CaptureAudio"),{
  ssr:false
}) ;
const CameraCapture = dynamic(()=> import("../common/CameraCapture"),{
  ssr:false
}) ;
const LocationPicker = dynamic(()=> import("../common/LocationPicker"),{
  ssr:false
}) ;

function MessageBar({ socket }) {
  const [Message, setMessage] = useState("");
  const [grabPhoto, setgrabPhoto] = useState(false);
  const [showEmojiPicker, setshowEmojiPicker] = useState(false);
  const [showAudioRecorder, setshowAudioRecorder] = useState(false);
  const [showCameraCapture, setshowCameraCapture] = useState(false);
  const [showLocationPicker, setshowLocationPicker] = useState(false);
  const [showAttachmentMenu, setshowAttachmentMenu] = useState(false);
  const documentPickerRef = useRef(null);

  const { UserInfo } = useSelector((state) => state.user);
  const { CurrentChatUser } = useSelector((state) => state.user);
  const emojiPickerRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const dispatch = useDispatch();

  const HandleEmojiModel = () => {
    setshowEmojiPicker(!showEmojiPicker);
  };

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      const resopnse = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multitpart/form-data",
        },
        params: {
          from: UserInfo.id,
          to: CurrentChatUser.id,
        },
      });
      if (resopnse.status === 201) {
        console.log(resopnse.data.message.messageStatus);
        dispatch(
          setAddMessages({
            senderId: UserInfo?.id,
            message: resopnse.data.message.message,
            recieverId: CurrentChatUser?.id,
            type: "image",
            createdAt: Date.now(),
            messageStatus: resopnse.data.message.messageStatus,
          })
        );
        socket.current.emit("send-msg", {
          senderId: UserInfo?.id,
          message: resopnse.data.message.message,
          recieverId: CurrentChatUser?.id,
          type: "image",
          createdAt: Date.now(),
          messageStatus: resopnse.data.message.messageStatus,
          original:true
        });
        getContacts();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cameraCapture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: UserInfo.id,
          to: CurrentChatUser.id,
        },
      });

      if (response.status === 201) {
        dispatch(
          setAddMessages({
            senderId: UserInfo?.id,
            message: response.data.message.message,
            recieverId: CurrentChatUser?.id,
            type: "image",
            createdAt: Date.now(),
            messageStatus: response.data.message.messageStatus,
          })
        );
        socket.current.emit("send-msg", {
          senderId: UserInfo?.id,
          message: response.data.message.message,
          recieverId: CurrentChatUser?.id,
          type: "image",
          createdAt: Date.now(),
          messageStatus: response.data.message.messageStatus,
          original: true,
        });
        getContacts();
      }
    } catch (error) {
      console.log("Error sending camera photo:", error);
      alert("Failed to send photo");
    }
  };

  const documentPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 25MB for documents)
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size should not exceed 25MB");
        return;
      }

      const formData = new FormData();
      formData.append("document", file);

      const response = await axios.post(ADD_DOCUMENT_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: UserInfo.id,
          to: CurrentChatUser.id,
        },
      });

      if (response.status === 201) {
        dispatch(
          setAddMessages({
            senderId: UserInfo?.id,
            message: response.data.message.message,
            recieverId: CurrentChatUser?.id,
            type: "document",
            createdAt: Date.now(),
            messageStatus: response.data.message.messageStatus,
            fileSize: file.size,
          })
        );
        socket.current.emit("send-msg", {
          senderId: UserInfo?.id,
          message: response.data.message.message,
          recieverId: CurrentChatUser?.id,
          type: "document",
          createdAt: Date.now(),
          messageStatus: response.data.message.messageStatus,
          fileSize: file.size,
        });
        getContacts();
      }
    } catch (error) {
      console.log("Error sending document:", error);
      alert("Failed to send document");
    }
  };

  const handleLocationShare = (locationData) => {
    try {
      const locationMessage = JSON.stringify(locationData);
      
      dispatch(
        setAddMessages({
          senderId: UserInfo?.id,
          message: locationMessage,
          recieverId: CurrentChatUser?.id,
          type: "location",
          createdAt: Date.now(),
          messageStatus: "sent",
        })
      );
      socket.current.emit("send-msg", {
        senderId: UserInfo?.id,
        message: locationMessage,
        recieverId: CurrentChatUser?.id,
        type: "location",
        createdAt: Date.now(),
        messageStatus: "sent",
      });
      getContacts();
    } catch (error) {
      console.log("Error sending location:", error);
      alert("Failed to send location");
    }
  };

  const userTyping = () => {
    socket.current.emit("typing", {
      recieverId: CurrentChatUser?.id,
    });
  }

  const userTypingblur = () => {
    socket.current.emit("typingblur", {
      recieverId: CurrentChatUser?.id,
    });
  }

  const HandleEmojiClick = (emoji) => {
    setMessage((preMeessage) => (preMeessage += emoji.emoji));
  };

  useEffect(() => {
    const HandleOutside = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setshowEmojiPicker(false);
        }
      }
      if (event.target.id !== "attachment-btn") {
        if (
          attachmentMenuRef.current &&
          !attachmentMenuRef.current.contains(event.target)
        ) {
          setshowAttachmentMenu(false);
        }
      }
    };
    document.addEventListener("click", HandleOutside);
    return () => {
      document.removeEventListener("click", HandleOutside);
    };
  },[]);

  const getContacts = async () =>{
    try {
      const {data:{users,onlineUsers}} = await axios.get(`${GET_INITIAL_CONTACT_ROUTE}/${UserInfo?.id}`)
      dispatch(setOnlineUser({onlineUsers}));
      dispatch(setUserContacts({userContacts:users}));
    } catch (error) {
      console.log(error)
    }
  }

  const sendMessage = async (e) => {
    setMessage("");
    e.preventDefault();
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: CurrentChatUser?.id,
        from: UserInfo?.id,
        message: Message,
      });
      
      dispatch(
        setAddMessages({
          senderId: UserInfo?.id,
          message: Message,
          recieverId: CurrentChatUser?.id,
          type: "text",
          createdAt: Date.now(),
          messageStatus: data.message.messageStatus,
        })
      );
      socket.current.emit("send-msg", {
        senderId: UserInfo?.id,
        message: Message,
        recieverId: CurrentChatUser?.id,
        type: "text",
        createdAt: Date.now(),
        messageStatus: "sent",
      });
      getContacts()
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setgrabPhoto(false);
        }, 5000);
      };
    }
  }, [grabPhoto]);

  return (
    <div className="bg-panel-header-background py-2 md:py-3 px-3 md:px-4 flex items-center gap-2 md:gap-3 w-full shrink-0">
      {!showAudioRecorder ? (
        <>
          {/* Left icons: Emoji + Attachment */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Emoji */}
            <div className="relative">
              <button
                id="emoji-open"
                onClick={HandleEmojiModel}
                className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
                title="Emoji"
              >
                <BsEmojiSmile
                  id="emoji-open"
                  className="text-panel-header-icon text-xl md:text-[22px] pointer-events-none"
                />
              </button>
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-14 left-0 z-40"
                >
                  <EmojiPicker
                    width={typeof window !== "undefined" && window.innerWidth < 768 ? Math.min(window.innerWidth - 24, 350) : 350}
                    height={380}
                    onEmojiClick={HandleEmojiClick}
                    theme="dark"
                  />
                </div>
              )}
            </div>

            {/* Attachment */}
            <div className="relative">
              <button
                id="attachment-btn"
                onClick={() => setshowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
                title="Attach"
              >
                <ImAttachment
                  id="attachment-btn"
                  className="text-panel-header-icon text-xl md:text-[22px] pointer-events-none"
                />
              </button>

              {showAttachmentMenu && (
                <div
                  ref={attachmentMenuRef}
                  className="absolute bottom-14 left-0 bg-[#233138] rounded-xl shadow-xl z-40 overflow-hidden min-w-[180px] border border-[#3b4a54]"
                >
                  <button
                    onClick={() => { setshowCameraCapture(true); setshowAttachmentMenu(false); }}
                    className="w-full px-4 py-3 hover:bg-[#182229] transition flex items-center gap-3 text-white text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#fe2c55] flex items-center justify-center shrink-0">
                      <MdCameraAlt className="text-white text-base" />
                    </span>
                    Camera
                  </button>
                  <button
                    onClick={() => { setgrabPhoto(true); setshowAttachmentMenu(false); }}
                    className="w-full px-4 py-3 hover:bg-[#182229] transition flex items-center gap-3 text-white text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#7f66ff] flex items-center justify-center shrink-0">
                      <MdImage className="text-white text-base" />
                    </span>
                    Gallery
                  </button>
                  <button
                    onClick={() => { documentPickerRef.current?.click(); setshowAttachmentMenu(false); }}
                    className="w-full px-4 py-3 hover:bg-[#182229] transition flex items-center gap-3 text-white text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#5157ae] flex items-center justify-center shrink-0">
                      <MdInsertDriveFile className="text-white text-base" />
                    </span>
                    Document
                  </button>
                  <button
                    onClick={() => { setshowLocationPicker(true); setshowAttachmentMenu(false); }}
                    className="w-full px-4 py-3 hover:bg-[#182229] transition flex items-center gap-3 text-white text-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#1fa855] flex items-center justify-center shrink-0">
                      <MdLocationOn className="text-white text-base" />
                    </span>
                    Location
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex-1 min-w-0">
            <input
              onFocus={userTyping}
              onBlur={userTypingblur}
              value={Message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
              placeholder="Type a message"
              className="bg-input-background text-sm focus:outline-none text-white h-10 md:h-11 rounded-lg px-3 md:px-4 w-full placeholder-[#8696a0]"
            />
          </form>

          {/* Send / Mic button */}
          <div className="shrink-0">
            {Message.length ? (
              <button
                onClick={sendMessage}
                className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
                title="Send Message"
              >
                <MdSend className="text-panel-header-icon text-xl md:text-2xl" />
              </button>
            ) : (
              <button
                onClick={() => setshowAudioRecorder(true)}
                className="p-2 rounded-full hover:bg-[#2a3942] transition-colors"
                title="Record"
              >
                <FaMicrophone className="text-panel-header-icon text-xl md:text-[22px]" />
              </button>
            )}
          </div>
        </>
      ) : (
        <CaptureAudio socket={socket} hide={(val) => setshowAudioRecorder(val ?? false)} />
      )}

      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {showCameraCapture && (
        <CameraCapture
          onCapture={cameraCapture}
          onClose={() => setshowCameraCapture(false)}
        />
      )}
      {showLocationPicker && (
        <LocationPicker
          onSendLocation={handleLocationShare}
          onClose={() => setshowLocationPicker(false)}
        />
      )}
      <input
        ref={documentPickerRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        onChange={documentPickerChange}
        className="hidden"
        id="document-picker"
      />
    </div>
  );
}

export default MessageBar;
