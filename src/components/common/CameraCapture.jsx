import React, { useState, useRef, useEffect, useCallback } from "react";
import { MdCameraAlt, MdClose, MdSend, MdDelete, MdFlipCameraAndroid } from "react-icons/md";

function CameraCapture({ onCapture, onClose }) {
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // data URL for preview
  const [capturedFile, setCapturedFile] = useState(null); // File object to send
  const streamRef = useRef(null);

  const videoRef = useRef(null);
  const setVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCapturedImage(null);
      setCapturedFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : error.name === "NotFoundError"
          ? "No camera found on this device."
          : "Error accessing camera: " + error.message
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (!canvas.width || !canvas.height) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get data URL for preview
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);

    // Create file for sending
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedFile(
            new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
          );
        }
      },
      "image/jpeg",
      0.95
    );

    // Pause the stream (keep tracks alive for recapture)
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleSend = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
    stopStream();
    onClose();
  };

  const handleDelete = () => {
    stopStream();
    setCapturedImage(null);
    setCapturedFile(null);
    setCameraActive(false);
    onClose();
  };

  const handleRecapture = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    // Resume video if stream still alive
    if (videoRef.current && streamRef.current) {
      videoRef.current.play();
    } else {
      startCamera();
    }
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  // ── Fullscreen camera / preview UI ──
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button (top-right) */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-80 transition"
      >
        <MdClose className="text-2xl" />
      </button>

      {/* ── Error state ── */}
      {cameraError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <MdCameraAlt className="text-7xl text-gray-600" />
          <p className="text-red-400 text-center text-sm max-w-xs">{cameraError}</p>
          <button
            onClick={handleClose}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Close
          </button>
        </div>
      )}

      {/* ── Preview state (after capture) ── */}
      {capturedImage && !cameraError && (
        <>
          <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Preview action bar */}
          <div className="bg-[#1a1a1a] px-6 py-5 flex items-center justify-around">
            <button
              onClick={handleDelete}
              className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition"
            >
              <div className="bg-red-500 bg-opacity-20 rounded-full p-3">
                <MdDelete className="text-2xl text-red-400" />
              </div>
              <span className="text-xs">Delete</span>
            </button>

            <button
              onClick={handleRecapture}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition"
            >
              <div className="bg-gray-700 rounded-full p-3">
                <MdFlipCameraAndroid className="text-2xl" />
              </div>
              <span className="text-xs">Retake</span>
            </button>

            <button
              onClick={handleSend}
              className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300 transition"
            >
              <div className="bg-green-600 rounded-full p-3">
                <MdSend className="text-2xl text-white" />
              </div>
              <span className="text-xs">Send</span>
            </button>
          </div>
        </>
      )}

      {/* ── Live camera state ── */}
      {!capturedImage && !cameraError && (
        <>
          <div className="flex-1 relative bg-black overflow-hidden">
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Capture shutter button */}
          {cameraActive && (
            <div className="bg-transparent absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraCapture;
