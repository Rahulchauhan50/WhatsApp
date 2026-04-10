import { createSlice } from '@reduxjs/toolkit';
import {calculateTime} from '../../utils/CalculateTime'

const initialState = {
  UserInfo:{
    name:"",
    email:"",
    profileImage:null,
    status:"",
    about:"Hi there! i am using whatsApp",
    NewUser:"",
    id:undefined,
    profileImageTemp:"/default_avatar.png",
  },
  ConstactPage:false,
  CurrentChatUser:undefined,
  Messages:undefined,
  socket:undefined,
  MessageSearch:false,
  UserContacts:[],
  OnlineUser:[],
  filteredContacts:[],
  videoCall:undefined,
  voiceCall:undefined,
  incomingVideoCall:undefined,
  incomingVoiceCall:undefined,
  Read:false,
  IsfetchingUser:true,
  ProfilePage:false,
  ContactInfo:false,
  activeTab:"chats",
  pagination: {
    skip: 0,
    limit: 50,
    hasMore: true,
    total: 0,
  },
  isLoadingOlderMessages: false,
};

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      if(action.payload?.name){
        state.UserInfo.name = action.payload.name;
      }
      if(action.payload?.email){
        state.UserInfo.email = action.payload.email;
      }
      if(action.payload?.profileImage){
        state.UserInfo.profileImage = action.payload.profileImage;
      }
      if(action.payload?.status){
        state.UserInfo.status = action.payload.status;
      }
      if(action.payload?.about){
        state.UserInfo.about = action.payload.about;
      }
      if(action.payload?.NewUser){
        state.UserInfo.NewUser = action.payload.NewUser;
      }
      if(action.payload?.id){
        state.UserInfo.id = action.payload.id;
      }
      if(action.payload?.profileImageTemp){
        state.UserInfo.profileImageTemp = action.payload.profileImageTemp;
      }
      // else{
      //   state.UserInfo = {
      //     name:"",
      //     email:"",
      //     profileImage:"/default_avatar.png",
      //     status:"",
      //     about:"Hi there! i am using whatsApp",
      //     NewUser:"",
      //     id:undefined,
      //   }
      // }
    },
    setConstactPage:(state, action) => {
      state.ConstactPage = !state.ConstactPage;
    },
    setCurrentChatUser:(state, action)=>{
      state.CurrentChatUser = action.payload.data;
    },
    setMessages:(state, action) => {
      state.Messages = action.payload.data.message;
      state.pagination = action.payload.data.pagination || {
        skip: 0,
        limit: 50,
        hasMore: true,
        total: 0,
      };
    },
    setSocket:(state, action) => {
      state.socket = action.payload;
    },
    setAddMessages:(state, action) => {
      if(state.CurrentChatUser){
        const keysArray = Object.keys(state.Messages);
        const LastMsgDate = keysArray[keysArray.length - 1];
        const newDate = new Date()
        if(LastMsgDate === calculateTime(newDate.toString())){
          state.Messages[LastMsgDate].push(action.payload);
        }else {
          // alert(LastMsgDate)
          // alert(calculateTime(newDate.toString()))
          const newKey = calculateTime(newDate.toString())
          state.Messages[newKey] = [action.payload];
        }
       
      }
    },
    setMessageSearch:(state, action) => {
      state.MessageSearch = !state.MessageSearch
    },
    setUserContacts:(state, action) => {
      state.UserContacts = action.payload.userContacts
    },
    setOnlineUser:(state, action) => {
      state.OnlineUser = action.payload.onlineUsers
    },
    setfilteredContacts: (state, action) => {
      const UserContacts = JSON.parse(JSON.stringify(state.UserContacts));
    
      const filteredContacts = UserContacts.filter((contact) => {
        const contacts = contact.id === contact.lastMessage.senderId
          ? contact.lastMessage.sender
          : contact.lastMessage.reciever;

        return contacts.name.toLowerCase().includes(action.payload.contactSearch.toLowerCase());
      });
    
      state.filteredContacts = filteredContacts;
    },
    setVideoCall:( state ,action) => {
      state.videoCall = action.payload.videoCall
    },
    setVoiceCall:( state ,action) => {
      state.voiceCall = action.payload.voiceCall
    },
    setIncomingVideoCall:( state ,action) => {
      state.incomingVideoCall = action.payload.incomingVideoCall
    },
    setIncomingVoiceCall:( state ,action) => {
      state.incomingVoiceCall = action.payload.incomingVoiceCall
    },
    EndCall:( state ) => {
      state.videoCall=undefined
      state.voiceCall=undefined
      state.incomingVideoCall=undefined
      state.incomingVoiceCall=undefined
    },
    setRead:(state, action) => {
      if(!state.Messages) return;
      
      // action.payload contains { readBy: userId } - the user who marked messages as read
      const readByUserId = action.payload?.readBy;
      
      const updatedMessages = {};
      Object.entries(state.Messages).forEach(([date, messageList]) => {
        updatedMessages[date] = messageList.map((msg) => ({
          ...msg,
          // Mark as read if: messages we sent (senderId === our id) AND received by the person who just opened chat
          messageStatus: (msg.senderId === state.UserInfo.id && msg.recieverId === readByUserId && msg.messageStatus !== "read") 
            ? "read" 
            : msg.messageStatus
        }));
      });
      state.Messages = updatedMessages;
    },
    setIsfetchingUser:(state, action) => {
      state.IsfetchingUser = action.payload;
    },
    setLoadingOlderMessages:(state, action) => {
      state.isLoadingOlderMessages = action.payload;
    },
    setProfilePage:(state, action) => {
      state.ProfilePage = action.payload;
    },
    setContactInfo:(state, action) => {
      state.ContactInfo = action.payload;
    },
    setActiveTab:(state, action) => {
      state.activeTab = action.payload;
    },
    addOlderMessages:(state, action) => {
      if(!state.Messages) return;
      
      const olderMessages = action.payload.data.message;
      const pagination = action.payload.data.pagination;
      
      // Merge older messages at the beginning
      const updatedMessages = {};
      
      // First add the older messages
      Object.entries(olderMessages).forEach(([date, messageList]) => {
        if(updatedMessages[date]){
          updatedMessages[date] = [...messageList, ...updatedMessages[date]];
        } else {
          updatedMessages[date] = messageList;
        }
      });
      
      // Then add the existing messages
      Object.entries(state.Messages).forEach(([date, messageList]) => {
        if(updatedMessages[date]){
          updatedMessages[date] = [...updatedMessages[date], ...messageList];
        } else {
          updatedMessages[date] = messageList;
        }
      });
      
      state.Messages = updatedMessages;
      state.pagination = pagination || state.pagination;
    },
  },
});



export const {setUserInfo, setConstactPage, setCurrentChatUser, setMessages, setSocket, setAddMessages, setMessageSearch, setUserContacts, setOnlineUser, setfilteredContacts, setVideoCall, setVoiceCall, setIncomingVideoCall, setIncomingVoiceCall, EndCall, setRead, setIsfetchingUser, setLoadingOlderMessages, addOlderMessages, setProfilePage, setContactInfo, setActiveTab} = UserSlice.actions;

export default UserSlice.reducer;


const rrr =  [{ 
  audiomessage: null,
createdAt: "2024-02-16T16:35:48.980Z",
id: "65cf8ee5f3db8ce8474362b1",
imagemessages: [],
message: "hii",
messageStatus: "read",
recieverId: "65a5693af97188731f6c17bc",
senderId: "65a60e47531736198b93e805",
type: "text"
 
  }]
