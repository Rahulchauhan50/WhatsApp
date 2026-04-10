import { GET_ALL_CONTACTS, IMPORT_GOOGLE_CONTACTS_ROUTE, GET_GOOGLE_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { setConstactPage } from "@/redux/features/userSlice";
import { BiSearchAlt2 } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList({socket}) {
  const [allContacts, setallContacts] = useState([]);
  const [serchTerm, setserchTerm] = useState('')
  const [searchContacts, setsearchContacts] = useState([])
  const [googleContacts, setGoogleContacts] = useState([])
  const [importingGoogle, setImportingGoogle] = useState(false)
  const [googleImportInfo, setGoogleImportInfo] = useState(null)
  const [activeTab, setActiveTab] = useState("all") // "all" or "google"
  const { UserInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getContacts = async () => {
    try {
      const {
        data: { users },
      } = await axios.get(GET_ALL_CONTACTS);
      setallContacts(users);
      setsearchContacts(users);
      console.log(users)
    } catch (error) {
      console.log(error);
    }
  };

  const loadSavedGoogleContacts = async () => {
    try {
      if (!UserInfo?.id) return;
      const { data } = await axios.get(`${GET_GOOGLE_CONTACTS_ROUTE}/${UserInfo.id}`);
      if (data.status) {
        setGoogleContacts(data.users);
        setGoogleImportInfo({
          total: data.totalGoogleContacts,
          matched: data.matchedCount,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleImportGoogleContacts = () => {
    if (!window.google?.accounts?.oauth2) {
      console.log("Google Identity Services not loaded yet");
      return;
    }
    setImportingGoogle(true);
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/contacts.other.readonly",
      callback: async (tokenResponse) => {
        try {
          if (tokenResponse.error) {
            console.log("Google token error:", tokenResponse);
            setImportingGoogle(false);
            return;
          }
          const accessToken = tokenResponse.access_token;
          const { data } = await axios.post(IMPORT_GOOGLE_CONTACTS_ROUTE, { accessToken, userId: UserInfo.id });
          console.log(data);
          if (data.status) {
            setGoogleContacts(data.users);
            setGoogleImportInfo({
              total: data.totalGoogleContacts,
              matched: data.matchedCount,
            });
            setActiveTab("google");
          }
        } catch (error) {
          console.log("Google contacts import error:", error);
        } finally {
          setImportingGoogle(false);
        }
      },
    });
    tokenClient.requestAccessToken();
  };

  useEffect(() => {
    getContacts();
    loadSavedGoogleContacts();
  }, []);

  useEffect(()=>{
    if(serchTerm.length){
      const filterdata = {}
      Object.keys(allContacts).forEach((key=>{
        filterdata[key] = allContacts[key].filter((obj)=>obj.name.toLowerCase().includes(serchTerm.toLowerCase()));
      }))
      setsearchContacts(filterdata)
    }else{
      setsearchContacts(allContacts)
    }
  },[serchTerm])
  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="cursor-pointer text-xl"
            onClick={() => {
              dispatch(setConstactPage());
            }}
          />
          <span>New Chat</span>
        </div>
      </div>
      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar-color">
        <div className="flex py-3 items-center gap-3 h-14 ">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-l" />
            </div>
            <div>
              <input
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                placeholder="search Contacts"
                type="text"
                value={serchTerm}
                onChange={e=>setserchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabs: All Contacts / Google Contacts */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              activeTab === "all"
                ? "bg-[#15603E] text-white"
                : "bg-panel-header-background text-gray-400"
            }`}
          >
            All Contacts
          </button>
          <button
            onClick={() => {
              if (Object.keys(googleContacts).length > 0) {
                setActiveTab("google");
              } else {
                handleImportGoogleContacts();
              }
            }}
            disabled={importingGoogle}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              activeTab === "google"
                ? "bg-teal-light text-white"
                : "bg-panel-header-background text-gray-400"
            } ${importingGoogle ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FcGoogle className="text-base" />
            {importingGoogle ? "Importing..." : "Google Contacts"}
          </button>
        </div>

        {/* Google import info banner */}
        {googleImportInfo && activeTab === "google" && (
          <div className="mx-4 mb-2 px-3 py-2 bg-panel-header-background rounded-lg text-xs text-gray-400 flex items-center justify-between">
            <span>Found {googleImportInfo.total} Google contacts · {googleImportInfo.matched} registered on this app</span>
            <button
              onClick={handleImportGoogleContacts}
              disabled={importingGoogle}
              className="text-teal-light hover:underline disabled:opacity-50 ml-2 whitespace-nowrap"
            >
              {importingGoogle ? "Syncing..." : "Re-sync"}
            </button>
          </div>
        )}

        {/* All Contacts Tab */}
        {activeTab === "all" && (
          <>
            {serchTerm.length>0? Object.entries(searchContacts).map(([initialLetter, userList]) => {
              return (
                <div key={Date.now() + initialLetter}>
                {userList.length>0 && <div className="text-teal-light pl-10 py-5">{initialLetter}</div>}
                  
                  {userList.map((contacts) => {
                    return <ChatLIstItem socket={socket} className="" data={contacts} isContactpage={true} key={contacts.id} />;
                  })}
                </div>
              );
            }):Object.entries(allContacts).map(([initialLetter, userList]) => {
              return (
                <div key={Date.now() + initialLetter}>
                  <div className="text-teal-light pl-10 py-5">{initialLetter}</div>
                  {userList.map((contacts) => {
                    return <ChatLIstItem socket={socket} className="" data={contacts} isContactpage={true} key={contacts.id} />;
                  })}
                </div>
              );
            })}
          </>
        )}

        {/* Google Contacts Tab */}
        {activeTab === "google" && (
          <>
            {Object.keys(googleContacts).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <FcGoogle className="text-4xl mb-3" />
                <p className="text-sm">Import contacts from your Google account</p>
                <button
                  onClick={handleImportGoogleContacts}
                  disabled={importingGoogle}
                  className="mt-3 px-4 py-2 bg-teal-light text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {importingGoogle ? "Importing..." : "Import Google Contacts"}
                </button>
              </div>
            ) : (
              Object.entries(googleContacts).map(([initialLetter, userList]) => {
                return (
                  <div key={"google-" + initialLetter}>
                    <div className="text-teal-light pl-10 py-5">{initialLetter}</div>
                    {userList.map((contacts) => {
                      return <ChatLIstItem socket={socket} className="" data={contacts} isContactpage={true} key={contacts.id} />;
                    })}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ContactsList;