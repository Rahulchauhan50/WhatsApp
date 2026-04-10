import React, { useEffect, useState } from "react";
import Avatar from "../common/Avatar";
import {MdCall} from 'react-icons/md'
import {IoVideocam} from 'react-icons/io5'
import {BiSearchAlt2} from "react-icons/bi"
import {BsThreeDotsVertical} from 'react-icons/bs'
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setVoiceCall, setVideoCall, setCurrentChatUser, setContactInfo } from '@/redux/features/userSlice';
import { setMessageSearch } from "@/redux/features/userSlice";
import { BsArrowLeftShort } from "react-icons/bs"
import ContextMenu from "../common/ContextMenu";
import CustomContextMenu from "../common/CustomContextMenu";

type ChatHeaderProps = {
  socket: any;
};

function ChatHeader({ socket }: ChatHeaderProps) {
  const { CurrentChatUser, OnlineUser , UserInfo} = useSelector((state: any) => state.user)
  const [typing, setTyping] = useState(false)
  const dispatch = useDispatch();

  const [contextMenuCordinates, setcontextMenuCordinates] = useState<{x:number;y:number}>({x:0,y:0})
  const [IsContextMenuVisible, setIsContextMenuVisible] = useState(false)

  const contextMenuOptions: { name: string; callback: () => void }[] = [
    {name:"view contact",callback:() => dispatch(setContactInfo(true))},
    {name:"Media, links, and docs",callback:() => {}},
    {name:"Search",callback:() => {}},
    {name:"Mute notifications",callback:() => {}},
    {name:"Disappearing mesages",callback:() => {}},
    {name:"wallpaper",callback:() => {}},
    {name:"More",callback:() => {}},
    {name:"Exist",callback:() => handleBack()}
  ]

  const showContextMenu = (e: React.MouseEvent<HTMLDivElement | SVGElement>) => {
    e.preventDefault();
    setIsContextMenuVisible(true)
    setcontextMenuCordinates({x:e.pageX,y:e.pageY})

  }

  const HandleVoiceCall = () => {
    dispatch(setVoiceCall({voiceCall:{...CurrentChatUser, type:"out-going", callType:"voice", roomId:Date.now()}}))
  }
  const HandleVideoCall = () => {
    dispatch(setVideoCall({videoCall:{...CurrentChatUser, type:"out-going", callType:"video", roomId:Date.now()}}))
  }

  useEffect(() => {
    if(socket.current){
      socket.current.on("user-typing",()=>{
        setTyping(true)
      })
      socket.current.on("user-typingblur",()=>{
        setTyping(false)
      })
    }
  }, [socket]);

  const handleBack = () => {
    dispatch(setCurrentChatUser({data:undefined}))
    socket.current.emit("send-msg-read", {to:undefined , by:UserInfo.id})
  }

  
  return <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10 " >
    <div className="flex items-center justify-center gap-2" >
    <BsArrowLeftShort className="lg:hidden" color="white" size={30} onClick={handleBack} />
      <div className="cursor-pointer" onClick={() => dispatch(setContactInfo(true))}>
        <Avatar type='sm' image={CurrentChatUser?.profileImage} />
      </div>
      <div className="flex flex-col cursor-pointer" onClick={() => dispatch(setContactInfo(true))}>
        <span className="text-primary-strong text-sm" >{CurrentChatUser?.name}</span>
        <span className={`${typing?"text-green-500":"text-secondary"} text-sm`} >
        {OnlineUser.includes(CurrentChatUser.id) && typing && "typing..."}
        {OnlineUser.includes(CurrentChatUser.id) && !typing &&  "online"}
        {!OnlineUser.includes(CurrentChatUser.id) && !typing && "offline"}
        </span>
      </div>
    </div>
    <div className="flex gap-6" >
        <MdCall onClick={HandleVoiceCall} className="text-panel-header-icon cursor-pointer text-xl"/>
        <IoVideocam onClick={HandleVideoCall} className="text-panel-header-icon cursor-pointer text-xl"/>
        <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" onClick={()=>dispatch(setMessageSearch(undefined))}/>
        {/* <BsThreeDotsVertical onClick={(e)=>showContextMenu(e)} className="text-panel-header-icon cursor-pointer text-xl context-openers"/> */}
        <CustomContextMenu options={contextMenuOptions} showContextMenu={showContextMenu} setContextMenu={setIsContextMenuVisible}/>
       
        {/* {
          IsContextMenuVisible && (<ContextMenu options={contextMenuOptions} cordinate={contextMenuCordinates} contextMenu={IsContextMenuVisible} setContextMenu={setIsContextMenuVisible} />)
        } */}
    </div>
  </div>;
}

export default ChatHeader;