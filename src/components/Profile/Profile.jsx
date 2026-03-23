import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo, setProfilePage } from "@/redux/features/userSlice";
import { BiArrowBack } from "react-icons/bi";
import { BsCheck2, BsPencil } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import axios from "axios";
import { UPDATE_PROFILE_ROUTE, HOST } from "@/utils/ApiRoutes";
import ContextMenu from "../common/ContextMenu";
import PhotoPicker from "../common/PhotoPicker";
import PhotoLibrary from "../common/PhotoLibrary";
import CapturePhoto from "../common/CapturePhoto";

function Profile() {
  const dispatch = useDispatch();
  const { UserInfo } = useSelector((state) => state.user);

  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [name, setName] = useState(UserInfo?.name || "");
  const [about, setAbout] = useState(UserInfo?.about || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hover, setHover] = useState(false);
  const [profileImageUpload, setProfileImageUpload] = useState(null);

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const nameInputRef = useRef(null);
  const aboutInputRef = useRef(null);

  useEffect(() => {
    setName(UserInfo?.name || "");
    setAbout(UserInfo?.about || "");
  }, [UserInfo]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingAbout && aboutInputRef.current) {
      aboutInputRef.current.focus();
    }
  }, [editingAbout]);

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = () => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 5000);
      };
    }
  }, [grabPhoto]);

  const contextMenuOptions = [
    {
      name: "Take Photo",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Choose from gallery",
      callback: () => {
        setShowPhotoLibrary(true);
      },
    },
    {
      name: "Upload Photo",
      callback: () => {
        setGrabPhoto(true);
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        dispatch(setUserInfo({ profileImageTemp: "/default_avatar.png" }));
        dispatch(setUserInfo({ profileImage: null }));
        setProfileImageUpload(null);
        handleUpdateField("profileImage", "remove");
      },
    },
  ];

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
  };

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageUpload(file);
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64Data = event.target.result;
      dispatch(setUserInfo({ profileImageTemp: base64Data }));
      dispatch(setUserInfo({ profileImage: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateField = async (field, value) => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("userId", UserInfo.id);

      if (field === "profileImage" && value === "remove") {
        formData.append("removeProfileImage", "true");
      } else if (field === "profileImage" && profileImageUpload) {
        formData.append("image", profileImageUpload);
      } else {
        formData.append(field, value);
      }

      const { data } = await axios.post(UPDATE_PROFILE_ROUTE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.status) {
        if (data.data?.profileImage) {
          dispatch(setUserInfo({ profileImage: data.data.profileImage }));
          dispatch(setUserInfo({ profileImageTemp: data.data.profileImage }));
        }
        if (field === "name") dispatch(setUserInfo({ name: value }));
        if (field === "about") dispatch(setUserInfo({ about: value }));
        setProfileImageUpload(null);
      } else {
        setError(data.msg || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = () => {
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }
    setEditingName(false);
    if (name !== UserInfo.name) {
      handleUpdateField("name", name.trim());
    }
  };

  const handleSaveAbout = () => {
    setEditingAbout(false);
    if (about !== UserInfo.about) {
      handleUpdateField("about", about.trim());
    }
  };

  const handleSavePhoto = () => {
    if (profileImageUpload) {
      handleUpdateField("profileImage", "upload");
    }
  };

  // Save photo when a new one is selected
  useEffect(() => {
    if (profileImageUpload) {
      handleSavePhoto();
    }
  }, [profileImageUpload]);

  const displayImage =
    UserInfo?.profileImage || UserInfo?.profileImageTemp || "/default_avatar.png";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-panel-header-background flex items-center gap-6 px-4 py-3 h-16">
        <BiArrowBack
          className="text-xl text-panel-header-icon cursor-pointer"
          onClick={() => dispatch(setProfilePage(false))}
        />
        <span className="text-white font-medium text-lg">Profile</span>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col overflow-y-auto custom-scrollbar-color flex-1 bg-search-input-container-background">
        {/* Profile Photo */}
        <div className="flex justify-center py-8">
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              onClick={showContextMenu}
              className={`z-10 bg-photopicker-overlay-background h-48 w-48 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2 ${
                hover ? "visible opacity-100" : "hidden opacity-0"
              } transition-opacity duration-200`}
            >
              <FaCamera className="text-2xl text-white" />
              <span className="text-sm text-white">
                Change
                <br />
                profile photo
              </span>
            </div>
            <div className="flex items-center h-48 w-48 rounded-full overflow-hidden">
              <Image
                src={displayImage}
                className="rounded-full bg-[#233138] object-cover"
                alt="profile"
                height={200}
                width={200}
                priority
              />
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-panel-header-background px-8 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-teal-light text-sm font-medium">Your name</span>
          </div>
          {editingName ? (
            <div className="flex items-center gap-3">
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setError("");
                  setName(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                maxLength={25}
                className="flex-1 bg-transparent text-white text-lg border-b-2 border-teal-light outline-none py-1"
              />
              <span className="text-secondary text-xs">{25 - name.length}</span>
              <BsCheck2
                className="text-teal-light text-2xl cursor-pointer"
                onClick={handleSaveName}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white text-lg">{UserInfo?.name}</span>
              <BsPencil
                className="text-secondary text-lg cursor-pointer hover:text-panel-header-icon"
                onClick={() => setEditingName(true)}
              />
            </div>
          )}
        </div>

        {/* Info text */}
        <div className="px-8 py-4">
          <p className="text-secondary text-sm leading-relaxed">
            This is not your username or pin. This name will be visible to your
            WhatsApp contacts.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-panel-header-background px-8 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-teal-light text-sm font-medium">About</span>
          </div>
          {editingAbout ? (
            <div className="flex items-center gap-3">
              <input
                ref={aboutInputRef}
                type="text"
                value={about}
                onChange={(e) => {
                  setError("");
                  setAbout(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveAbout()}
                maxLength={139}
                className="flex-1 bg-transparent text-white text-lg border-b-2 border-teal-light outline-none py-1"
              />
              <span className="text-secondary text-xs">{139 - about.length}</span>
              <BsCheck2
                className="text-teal-light text-2xl cursor-pointer"
                onClick={handleSaveAbout}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white text-lg">
                {UserInfo?.about || "Hi there! I am using WhatsApp"}
              </span>
              <BsPencil
                className="text-secondary text-lg cursor-pointer hover:text-panel-header-icon"
                onClick={() => setEditingAbout(true)}
              />
            </div>
          )}
        </div>

        {/* Email Section (read-only) */}
        <div className="bg-panel-header-background px-8 py-4 mt-2">
          <div className="mb-1">
            <span className="text-teal-light text-sm font-medium">Email</span>
          </div>
          <span className="text-secondary text-lg">{UserInfo?.email}</span>
        </div>

        {/* Error / saving indicator */}
        {error && (
          <div className="px-8 py-2">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
        {saving && (
          <div className="px-8 py-2">
            <span className="text-teal-light text-sm">Saving...</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinate={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
      {showPhotoLibrary && (
        <PhotoLibrary hidePhotoLibrary={setShowPhotoLibrary} />
      )}
      {showCapturePhoto && (
        <CapturePhoto
          setprofileImageUpload={setProfileImageUpload}
          hide={setShowCapturePhoto}
        />
      )}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </div>
  );
}

export default Profile;
