import React, { useState } from "react";
import { MdLocationOn, MdOpenInNew } from "react-icons/md";
import MessageStatus from "../common/MessageStatus";

function LocationMessage({ message }) {
  const [showMap, setShowMap] = useState(false);

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return dateObject.toLocaleString('en-US', options);
  };

  let locationData;
  try {
    locationData = JSON.parse(message.message);
  } catch {
    locationData = {
      latitude: 0,
      longitude: 0,
      address: "Invalid location",
      mapUrl: "#",
    };
  }

  return (
    <div className={`flex max-w-xs gap-2 rounded-lg p-3 ${
        message.senderId === message.currentUserId
          ? "bg-outgoing-background"
          : "bg-incoming-background"
      }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <MdLocationOn className="text-red-500 text-lg flex-shrink-0" />
          <span className="text-white text-sm font-semibold">Location</span>
        </div>
        
        {/* Map Preview */}
        {!showMap && (
          <div className="w-full mb-2 rounded overflow-hidden cursor-pointer">
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${locationData.latitude},${locationData.longitude}&zoom=15&size=300x200&markers=${locationData.latitude},${locationData.longitude}&key=AIzaSyDummy`}
              alt="Location"
              className="w-full h-auto rounded"
              onError={(e) => {
                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23333' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EMap Preview%3C/text%3E%3C/svg%3E`;
              }}
            />
          </div>
        )}

        <div className="text-gray-300 text-xs mb-2">
          <p>
            {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <a
            href={locationData.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded transition"
          >
            <MdOpenInNew className="text-sm" />
            Open in Maps
          </a>
          <div className="flex items-end gap-1">
            <span className="text-bubble-meta text-[11px] min-w-fit">
              {getTime(message.createdAt)}
            </span>
            <span className="text-bubble-meta">
              {message.senderId === message.currentUserId && <MessageStatus messageStatus={message.messageStatus} />}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationMessage;
