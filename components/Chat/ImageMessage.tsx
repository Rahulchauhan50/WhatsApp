import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { GET_IMAGE_ROUTE, HOST } from "@/utils/ApiRoutes";
import MessageStatus from "../common/MessageStatus";
import axios from "axios";
import { FaCamera } from "react-icons/fa";

function ImageMessage({ message }) {
  const { CurrentChatUser } = useSelector((state) => state.user);
  const { UserInfo } = useSelector((state) => state.user);

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return dateObject.toLocaleString('en-US', options);
  };

  return (
    <div className={`p-1 rounded-lg ${
        message.senderId === CurrentChatUser.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}>
      <div className="relative">
        <Image
          src={message.message}
          className="rounded-lg"
          height={300}
          width={300}
          alt="asset"
          loading="lazy"
        />
        <div className="absolute bottom-1 right-1 flex items-end gap-1">
          <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
          {getTime(message.createdAt)}
          </span>
          <span className="text-bubble-meta">
            {
              message.senderId === UserInfo.id  && <MessageStatus messageStatus={message.messageStatus} />
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default ImageMessage;
