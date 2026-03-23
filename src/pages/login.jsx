import React, { useEffect, useState } from "react";
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/utils/FirebaseConfig';
import { useRouter } from 'next/router';
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useDispatch } from "react-redux";
import { setUserInfo } from '@/redux/features/userSlice';




function login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser?.email) {
        try {
          const { data } = await axios.post(CHECK_USER_ROUTE, { email: currentUser.email });
          if (data.status) {
            router.push("/");
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(firebaseAuth);
      if (!result) return;
      const user = result.user;

      if (user) {
        const email = user.email;
        const { data } = await axios.post(CHECK_USER_ROUTE, { email });

        if (!data.status) {
          dispatch(setUserInfo({
            name: user.displayName,
            email: user.email,
            profileImageTemp: user.photoURL,
            status: "available",
            NewUser: true
          }));
          router.push("/onboarding");
        } else if (data.status) {
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleRedirectResult();
  }, []);

  const handlelogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(firebaseAuth, provider);
      const email = user.email;

      const { data } = await axios.post(CHECK_USER_ROUTE, { email });
      
      if (!data.status) {
        dispatch(setUserInfo({ 
          name: user.displayName, 
          email: user.email, 
          profileImageTemp: user.photoURL, 
          status: "available", 
          NewUser: true 
        }));
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className='bg-cover bg-no-repeat bg-[#26A884] pt-[100px] h-[200px]'></div>
      <div className='justify-center items-center mx-auto mt-[-100px] flex'>
        <div style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 30px rgba(0, 0, 0, 0.3)" }} className='bg-[#ffffff] md:w-[80vw] w-[95vw] justify-start items-center mb-14 flex flex-col rounded-lg'>
          <div className='justify-start items-center flex flex-col mt-[100px]'>
            <div className='justify-start items-center flex-col font-[300] text-[18px] md:text-[28px] text-[#41525D] m-1'>
              Sign in to Whatsapp
            </div>
            <div className='font-[400] md:text-[16px] text-[10px] text-[#8696A0] m-1'>
              Sign in with your Google account
            </div>
          </div>
          <div style={{ boxShadow: "0px 4px 0px rgba(250, 250, 250, 0.9), 0 4px 30px rgb(181 181 181 / 41%)" }} className='flex flex-row justify-between my-12'>
            <button
              onClick={handlelogin}
              disabled={loading}
              className={`flex font-[600] items-center justify-center w-full h-[42px] py-2 px-4 rounded-md shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'}`}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </>
              ) : (
                <>
                  <img alt='google' className="w-8 h-8 rounded-[10px] my-4 cursor-pointer mr-2" src='./google.svg' />
                  Sign In with Google
                </>
              )}
            </button>
          </div>
          <div className='mt-12 bg-[#F9F9FA] w-full py-8'>
            <div className='font-[300] items-center justify-center flex text-[18px] md:text-[28px] text-[#41525D] m-1'>
              Tutorial
            </div>
            <div className='font-[400] md:text-[14px] text-[12px] items-center justify-center flex text-[#008069] m-1'>
              Need help to get started
            </div>
            <div className='flex items-center justify-center m-14'>
              <Image src='/tutorial.png' alt="whatsapp" height={500} width={500} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default login;
