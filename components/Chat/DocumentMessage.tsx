import React, { useState, useEffect } from "react";
import { MdDownload, MdOpenInNew } from "react-icons/md";
import MessageStatus from "../common/MessageStatus";

function DocumentMessage({ message }) {
  const [fileSize, setFileSize] = useState("Unknown size");

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileName = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  // Fetch file size from server headers
  useEffect(() => {
    const fetchFileSize = async () => {
      try {
        // If fileSize is already provided, use it
        if (message.fileSize) {
          setFileSize(formatFileSize(message.fileSize));
          return;
        }

        // Otherwise, make a HEAD request to get the Content-Length header
        const response = await fetch(message.message, { method: "HEAD" });
        const contentLength = response.headers.get("content-length");
        
        if (contentLength) {
          setFileSize(formatFileSize(parseInt(contentLength)));
        } else {
          setFileSize("Unknown size");
        }
      } catch (error) {
        console.log("Error fetching file size:", error);
        setFileSize("Unknown size");
      }
    };

    fetchFileSize();
  }, [message.message, message.fileSize]);

  const handleDownload = async () => {
    try {
      const response = await fetch(message.message);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName(message.message);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const fileName = getFileName(message.message);
  const fileType = fileName.split(".").pop().toUpperCase();

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return dateObject.toLocaleString('en-US', options);
  };

  return (
    <div
      className={`flex flex-col max-w-xs gap-1 p-3 rounded-lg ${
        message.senderId === message.currentUserId
          ? "bg-outgoing-background"
          : "bg-incoming-background"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-700 rounded">
          <span className="text-xs font-bold text-white">{fileType}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{fileName}</p>
          <p className="text-gray-300 text-xs">{fileSize}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-600 rounded transition"
            title="Download"
          >
            <MdDownload className="text-white text-lg" />
          </button>
          <a
            href={message.message}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-600 rounded transition"
            title="Open"
          >
            <MdOpenInNew className="text-white text-lg" />
          </a>
        </div>
      </div>
      <div className="flex items-end justify-end gap-1">
        <span className="text-bubble-meta text-[11px] min-w-fit">
          {getTime(message.createdAt)}
        </span>
        <span className="text-bubble-meta">
          {message.senderId === message.currentUserId && <MessageStatus messageStatus={message.messageStatus} />}
        </span>
      </div>
    </div>
  );
}

export default DocumentMessage;
