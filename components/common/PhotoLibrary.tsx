import React, { useState, useEffect } from "react";
import {IoClose} from 'react-icons/io5'
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setUserInfo } from '@/redux/features/userSlice';

function PhotoLibrary({hidePhotoLibrary}) {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const images = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
    "/avatars/8.png",
    "/avatars/9.png",
  ]

  const handleImageLoad = (img) => {
    setLoadedImages(prev => new Set([...prev, img]));
  }

  const handleclick = (img) => {
    setSelectedImage(img);
    dispatch(setUserInfo({profileImage:img}));
    dispatch(setUserInfo({profileImageTemp:img}));
    setTimeout(() => {
      hidePhotoLibrary(false);
    }, 300);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Select Avatar</h2>
          <button
            onClick={() => hidePhotoLibrary(false)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <IoClose className='h-6 w-6 cursor-pointer text-gray-400 hover:text-white' />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
            {images.map((img) => {
              const isLoaded = loadedImages.has(img);
              const isSelected = selectedImage === img;

              return (
                <div
                  key={img}
                  onClick={() => handleclick(img)}
                  className={`relative cursor-pointer transform transition-all duration-200 hover:scale-110 group ${isSelected ? 'scale-105' : ''}`}
                >
                  {/* Loading Skeleton */}
                  {!isLoaded && (
                    <div className="h-28 w-28 bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl animate-pulse" />
                  )}

                  {/* Image Container */}
                  <div
                    className={`h-28 w-28 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-500 shadow-lg shadow-teal-500/50'
                        : 'border-gray-600 group-hover:border-teal-400'
                    } ${!isLoaded ? 'hidden' : ''}`}
                  >
                    <Image
                      src={img}
                      alt='avatar'
                      width={112}
                      height={112}
                      priority={false}
                      loading="lazy"
                      onLoad={() => handleImageLoad(img)}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                    />
                  </div>

                  {/* Selection Checkmark */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-teal-500 rounded-full p-1 shadow-lg">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Click an avatar to select it for your profile
          </p>
        </div>
      </div>
    </div>
  );
}

export default PhotoLibrary;
