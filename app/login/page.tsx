'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/redux/features/userSlice";
import { BsShieldLockFill } from "react-icons/bs";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (currentUser) => {
        if (currentUser?.email) {
          try {
            const { data } = await axios.post(CHECK_USER_ROUTE, {
              email: currentUser.email,
            });
            if (data.status) {
              router.push("/");
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
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
          dispatch(
            setUserInfo({
              name: user.displayName,
              email: user.email,
              profileImageTemp: user.photoURL,
              status: "available",
              NewUser: true,
            })
          );
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
        dispatch(
          setUserInfo({
            name: user.displayName,
            email: user.email,
            profileImageTemp: user.photoURL,
            status: "available",
            NewUser: true,
          })
        );
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
    <div className="min-h-[100dvh] flex flex-col bg-[#111b21]">
      <div className="h-[222px] bg-[#00a884] absolute top-0 left-0 right-0 z-0" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-start pt-10 sm:pt-14 px-4 pb-8">
        <div className="flex items-center gap-2 mb-8 sm:mb-10">
          <svg viewBox="0 0 39 39" width="39" height="39" className="flex-shrink-0">
            <path
              fill="#00E676"
              d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"
            />
            <path
              fill="#FFF"
              d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5s-1.6-.7-2.6-1.2c-.1 0-.2-.1-.3-.1-.3 0-.5.1-.7.2 0 0-.1.1-1.5 1.7-.1.2-.3.3-.5.3h-.1c-.1 0-.3-.1-.4-.2l-.5-.2c-1.1-.5-2.1-1.1-2.9-1.9-.2-.2-.5-.4-.7-.6-.7-.7-1.4-1.5-1.9-2.4l-.1-.2c-.1-.1-.1-.2-.2-.4 0-.2 0-.4.1-.5 0 0 .4-.5.7-.8.2-.2.3-.5.5-.7.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.2 0-.4.1-.6.1l-.1.1c-.2.1-.4.3-.6.4-.2.2-.3.4-.5.6-.7.9-1.1 2-1.1 3.1 0 .8.2 1.6.5 2.3l.1.3c.9 1.9 2.1 3.6 3.7 5.1l.4.4c.3.3.6.5.8.8 2.1 1.8 4.5 3.1 7.2 3.8.3.1.7.1 1 .2h1c.5 0 1.1-.2 1.5-.4.3-.2.5-.2.7-.4l.2-.2c.2-.2.4-.3.6-.5s.3-.4.5-.6c.2-.4.3-.9.4-1.4v-.7s-.1-.1-.3-.2z"
            />
          </svg>
          <span className="text-white text-base sm:text-lg font-normal tracking-wide uppercase">
            WhatsApp Web
          </span>
        </div>

        <div className="w-full max-w-[880px] bg-[#1f2c34] rounded-md shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 flex flex-col items-center md:items-start justify-center px-8 py-12 md:px-14 md:py-16">
              <h1 className="text-[#e9edef] text-xl sm:text-2xl font-light mb-3 text-center md:text-left">
                Log in with your Google account
              </h1>
              <p className="text-[#8696a0] text-sm leading-relaxed mb-10 text-center md:text-left max-w-sm">
                To use WhatsApp on your computer, sign in with Google to sync your account.
              </p>

              <ol className="text-[#8696a0] text-sm space-y-4 mb-10 list-decimal list-inside">
                <li>Click the button below to sign in</li>
                <li>Authorize with your Google account</li>
                <li>Set up your profile and start chatting</li>
              </ol>

              <button
                onClick={handlelogin}
                disabled={loading}
                className={`group relative flex items-center justify-center gap-3 w-full max-w-xs h-12 rounded-full transition-all duration-200 ${
                  loading
                    ? "bg-[#0b141a] cursor-not-allowed opacity-60"
                    : "bg-[#00a884] hover:bg-[#06cf9c] active:scale-[0.98] cursor-pointer"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-white text-sm font-medium">
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <img alt="Google" className="w-5 h-5" src="/google.svg" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      Continue with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center px-14 py-16">
              <div className="relative w-[264px] h-[264px] bg-[#111b21] rounded-lg flex items-center justify-center">
                <Image
                  src="/favicon.png"
                  alt="Whatsapp"
                  width={160}
                  height={160}
                  className="opacity-20"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      viewBox="0 0 39 39"
                      width="60"
                      height="60"
                      className="mx-auto mb-3 opacity-40"
                    >
                      <path
                        fill="#00a884"
                        d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-[#8696a0] text-xs mt-6 text-center max-w-[264px]">
                Sign in once to access all your chats and calls from the web.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-5 border-t border-[#2a3942]">
            <BsShieldLockFill
              className="text-[#8696a0] flex-shrink-0"
              size={12}
            />
            <span className="text-[#8696a0] text-xs">
              Your personal messages are end-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

