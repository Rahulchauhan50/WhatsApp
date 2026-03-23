import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { BsFillChatLeftTextFill, BsThreeDotsVertical} from 'react-icons/bs'
import { useDispatch } from "react-redux";
import { setConstactPage, setUserInfo, setProfilePage } from '@/redux/features/userSlice';
import { useSelector } from "react-redux";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import CustomContextMenu from "../common/CustomContextMenu";

function ChatListHeader({socket}) {
  const dispatch = useDispatch();
  const { UserInfo,IsfetchingUser } = useSelector((state) => state.user)
  const router = useRouter()

  
  const [contextMenuCordinates, setcontextMenuCordinates] = useState({x:0,y:0})
  const [IsContextMenuVisible, setIsContextMenuVisible] = useState(false)

  const contextMenuOptions = [
    
    {name:"New group",callback:() => {}},
    {name:"New broadcast",callback:() => {}},
    {name:"Liked devices",callback:() => {}},
    {name:"Starred messages",callback:() => {}},
    {name:"payments",callback:() => {}},
    {name:"settings",callback:() => {}},
    {name:"Log out",callback:() => {
      setIsContextMenuVisible(false)
      socket.current.emit("signout", UserInfo.id)
      signOut(firebaseAuth)
      dispatch(setUserInfo())
      router.push("/login")
    }},
  ]

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true)
    setcontextMenuCordinates({x:e.pageX,y:e.pageY})

  }


  return <div className="h-16 px-4 py-3 flex justify-between items-center">
    <div onClick={() => dispatch(setProfilePage(true))} className="cursor-pointer">
      {
        IsfetchingUser? <div className="animate-pulse flex space-x-4">

        <div className="rounded-full bg-slate-700 h-10 w-10"></div>
      </div>:<Avatar  type="sm" image={UserInfo?.profileImage}/>
      }
      
     
    </div>
    <div className="flex gap-6">
      <BsFillChatLeftTextFill onClick={()=>{dispatch(setConstactPage());}} className="text-panel-header-icon cursor-pointer text-xl" title="New Chat" />
      <>
      {/* <BsThreeDotsVertical  onClick={(e)=>showContextMenu(e)}  className="text-panel-header-icon cursor-pointer text-xl" />
      {IsContextMenuVisible && <ContextMenu options={contextMenuOptions} cordinate={contextMenuCordinates} contextMenu={IsContextMenuVisible} setContextMenu={setIsContextMenuVisible}/>} */}
      <CustomContextMenu options={contextMenuOptions} showContextMenu={showContextMenu} contextMenu={IsContextMenuVisible} setContextMenu={setIsContextMenuVisible}/>
      </>
    </div>
  </div>;
}

export default ChatListHeader;
