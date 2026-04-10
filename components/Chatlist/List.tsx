import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setUserContacts, setOnlineUser } from '@/redux/features/userSlice';
import { GET_INITIAL_CONTACT_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import ChatLIstItem from "./ChatLIstItem";
import { data } from "autoprefixer";

function List({socket}) {
  const { UserInfo } = useSelector((state) => state.user)
  const { filteredContacts } = useSelector((state) => state.user)
  const { UserContacts } = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    const getContacts = async () =>{
      try {
        const {data:{users,onlineUsers}} = await axios.get(`${GET_INITIAL_CONTACT_ROUTE}/${UserInfo?.id}`)
        dispatch(setOnlineUser({onlineUsers}));
        dispatch(setUserContacts({userContacts:users}));
        setIsLoading(false)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
      }
    }
    if(UserInfo.id){
      getContacts()
    }
  },[UserInfo?.id])

  return <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full " >
    {
      filteredContacts && filteredContacts.length>0?filteredContacts?.map((contacts)=>{
        return <ChatLIstItem socket={socket} data={contacts.id===contacts.lastMessage.senderId?contacts.lastMessage.sender:contacts.lastMessage.reciever} key={contacts?.id} unreadMessageCount={contacts?.unreadMessageCount} lastMessage={contacts?.lastMessage}/>
    
      }):UserContacts?.map((contacts)=>{
        return <ChatLIstItem socket={socket} data={contacts.id === contacts.lastMessage.senderId ? contacts.lastMessage.sender : contacts.lastMessage.reciever} key={contacts?.id} unreadMessageCount={contacts?.unreadMessageCount} lastMessage={contacts?.lastMessage} />
    
      })
    }
    {isLoading &&
      [1,2,3,4,5,6,7].map((e)=>{
        return <div key={e} className="border-b border-conversation-border shadow p-4 w-full mx-auto">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-700 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-700 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                <div className="h-2 bg-slate-700 rounded col-span-1"></div>
              </div>
              {/* <div className="h-2 bg-slate-700 rounded"></div> */}
            </div>
          </div>
        </div>
      </div>
      })

    }
  </div>
}

export default List;
