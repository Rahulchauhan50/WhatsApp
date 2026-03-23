import React, { useEffect, useState } from "react";
import Image from "next/image"
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setUserInfo } from '@/redux/features/userSlice';
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { ONBOARD_USER_ROUTE, CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";

function onboarding() {
  const router = useRouter();
  const { UserInfo } = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const [profileImageUpload, setprofileImageUpload] = useState(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onBoardUserHandler = async () => {
    setError("");
    if(validateDetails()){
     
      try {
        setLoading(true);
        const formData = new FormData();
        if(profileImageUpload) {
          formData.append("image", profileImageUpload);
        }
  
        const { data } = await axios.post(ONBOARD_USER_ROUTE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            email: UserInfo.email,
            name: UserInfo.name,
            about: UserInfo.about,
            image: UserInfo.profileImage ? UserInfo.profileImage : UserInfo.profileImageTemp
          }
        })
        if(data.status) {
          router.push('/')
        }
      } catch (error) {
        console.log(error);
        setError("Failed to create profile. Please try again.");
        setLoading(false);
      }
    }
  }

  const validateDetails = () => {
    if(!UserInfo?.name || UserInfo.name.length < 3) {
      setError("Display Name must be at least 3 characters");
      return false;
    }
    if(!UserInfo?.about || UserInfo.about.length < 1) {
      setError("Please add an About text");
      return false;
    }
    return true;
  }

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser?.email) {
        try {
          const { data } = await axios.post(CHECK_USER_ROUTE, { email: currentUser.email });
          if (data.status) {
            router.push("/");
            return;
          }
        } catch (error) {
          console.log(error);
        }
      }
      if(!UserInfo?.NewUser && !UserInfo?.email ){
        router.push("/login")
      }else if(!UserInfo?.NewUser && UserInfo?.email){
        router.push('/')
      }
    });
    return () => unsubscribe();
  },[UserInfo,router])

  return (
    <div className="bg-panel-header-background min-h-screen w-screen text-white flex flex-col items-center justify-center py-8 md:py-0">
      <div className="w-full max-w-md px-6 md:px-0">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Create Your Profile</h1>
          <p className="text-gray-400 text-sm md:text-base">Set up your WhatsApp account to get started</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col-reverse md:flex-row gap-8 items-center md:items-start mb-8">
          
          {/* Form Section */}
          <div className="flex flex-col gap-6 w-full md:flex-1">
            {/* Display Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-teal-light text-sm font-semibold">
                Display Name
              </label>
              <input 
                type="text" 
                id="name"
                placeholder="Enter your display name"
                value={UserInfo?.name || ""} 
                onChange={(e) => {
                  setError("");
                  dispatch(setUserInfo({ name: e.target.value }));
                }} 
                className="bg-input-background focus:bg-opacity-90 text-white placeholder-gray-500 focus:outline-none focus:border-2 focus:border-teal-light h-12 rounded-lg px-4 py-2 w-full transition-all duration-200"
              />
              {UserInfo?.name && UserInfo.name.length < 3 && (
                <p className="text-red-400 text-xs">Name must be at least 3 characters</p>
              )}
            </div>

            {/* About */}
            <div className="flex flex-col gap-2">
              <label htmlFor="about" className="text-teal-light text-sm font-semibold">
                About
              </label>
              <input 
                type="text" 
                id="about"
                placeholder="e.g., Available, Busy, Custom status"
                value={UserInfo?.about || ""} 
                onChange={(e) => {
                  setError("");
                  dispatch(setUserInfo({ about: e.target.value }));
                }} 
                className="bg-input-background focus:bg-opacity-90 text-white placeholder-gray-500 focus:outline-none focus:border-2 focus:border-teal-light h-12 rounded-lg px-4 py-2 w-full transition-all duration-200"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Avatar Section */}
          <div className="w-full md:flex-1 flex justify-center md:justify-start">
            <Avatar type='xl' image={UserInfo?.profileImage} setprofileImageUpload={setprofileImageUpload}/>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={onBoardUserHandler} 
          disabled={loading || !UserInfo?.name || !UserInfo?.about}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Creating Profile...
            </>
          ) : (
            <>
              <span>✓</span>
              Create Profile
            </>
          )}
        </button>

        {/* Info Text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          You can update your profile anytime in settings
        </p>
      </div>
    </div>
  );
}

export default onboarding;
