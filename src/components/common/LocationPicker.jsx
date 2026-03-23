import React, { useState } from "react";
import { MdLocationOn, MdClose } from "react-icons/md";

function LocationPicker({ onSendLocation, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          latitude,
          longitude,
          address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
        };
        onSendLocation(locationData);
        setIsLoading(false);
        onClose();
      },
      (error) => {
        console.error("Error getting location:", error);
        setError(error.message || "Unable to access location");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-panel-header-background rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MdLocationOn className="text-red-500 text-2xl" />
            <h3 className="text-white text-lg font-semibold">Share Location</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-6">
          Share your current location with this contact. They will be able to see your exact coordinates on a map.
        </p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MdLocationOn className="text-lg" />
                Send My Location
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;
