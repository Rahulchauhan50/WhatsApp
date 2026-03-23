import Main from "@/components/Main";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useDispatch } from "react-redux";
import { setIsfetchingUser, setUserInfo } from "@/redux/features/userSlice";


function index() {

  //test

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(()=>{
    onAuthStateChanged(firebaseAuth,async (currentUser) => {
      if(!currentUser) router.push('/login')
      if(currentUser?.email){
        try {
          const {data} = await axios.post(CHECK_USER_ROUTE,{email:currentUser.email});
          console.log(data)
          if(!data.status){
            router.push('/login')
          }
          else if(data.status){
            dispatch(setUserInfo({name:data.data.name,email:data.data.email,profileImage:data.data.profileImage, about:data.data.about, status:"available",NewUser:false,id:data.data.id}));
            dispatch(setIsfetchingUser(false));
          }
        } catch (error) {
          console.log(error)
          dispatch(setIsfetchingUser(false));
          router.push('/login')
        }
       
      }
  })
  },[router, dispatch])

  
  return <Main/>;
}

export default index;