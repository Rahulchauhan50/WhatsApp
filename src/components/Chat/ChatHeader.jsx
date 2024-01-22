import React from "react";
import Avatar from "../common/Avatar";
import {MdCall} from 'react-icons/md'
import {IoVideocam} from 'react-icons/io5'
import {BiSearchAlt2} from "react-icons/bi"
import {BsThreeDotsVertical} from 'react-icons/bs'
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setUserInfo } from '@/redux/features/userSlice';
import { setMessageSearch } from "@/redux/features/userSlice";
function ChatHeader() {
  const { UserInfo} = useSelector((state) => state.user)
  const { CurrentChatUser } = useSelector((state) => state.user)
  const dispatch = useDispatch();
  
  return <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10 " >
    <div className="flex items-center justify-center gap-6" >
      <Avatar type='sm' image={CurrentChatUser?.profileImage} />
      <div className="flex flex-col">
        <span className="text-primary-strong" >{CurrentChatUser?.name}</span>
        <span className="text-secondary text-sm" >Offline/online</span>
      </div>
    </div>
    <div className="flex gap-6" >
        <MdCall className="text-panel-header-icon cursor-pointer text-xl"/>
        <IoVideocam className="text-panel-header-icon cursor-pointer text-xl"/>
        <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" onClick={()=>dispatch(setMessageSearch())}/>
        <BsThreeDotsVertical className="text-panel-header-icon cursor-pointer text-xl"/>
    </div>
  </div>;
}

export default ChatHeader;
