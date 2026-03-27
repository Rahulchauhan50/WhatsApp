import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EndCall, setAddMessages } from "@/redux/features/userSlice";
import { MdCallEnd, MdMic, MdMicOff } from "react-icons/md";
import Image from "next/image";
import axios from "axios";
import { ADD_CALL_MESSAGE_ROUTE } from "@/utils/ApiRoutes";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function Container({ socket, data }) {
  const { UserInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const [callStatus, setCallStatus] = useState(data.type === "out-going" ? "Ringing..." : "Connecting...");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const candidateQueue = useRef([]);
  const ringTimeoutRef = useRef(null);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  }, []);

  const callSaved = useRef(false);

  const saveCallLog = useCallback(async (status) => {
    if (callSaved.current) return;
    callSaved.current = true;
    try {
      const { data: response } = await axios.post(ADD_CALL_MESSAGE_ROUTE, {
        from: UserInfo.id,
        to: data.id,
        callType: data.callType,
        duration: callDuration,
        status,
      });
      
      const callMsg = response.message;
      
      // Immediately add message to sender's chat
      dispatch(
        setAddMessages({
          id: callMsg.id,
          message: callMsg.message,
          senderId: callMsg.senderId,
          recieverId: callMsg.recieverId,
          type: "call",
          createdAt: callMsg.createdAt,
          messageStatus: "read",
        })
      );
      
      // Emit socket event to notify the other user about the call message
      socket.current.emit("send-msg", {
        id: callMsg.id,
        message: callMsg.message,
        senderId: callMsg.senderId,
        recieverId: callMsg.recieverId,
        type: "call",
        createdAt: callMsg.createdAt,
        messageStatus: "read",
      });
    } catch (err) {
      console.log("Failed to save call log:", err);
    }
  }, [UserInfo.id, data.id, data.callType, callDuration, dispatch]);

  const endCall = useCallback(() => {
    // Determine status: if duration >3s, likely completed; else check connectionState
    const status = 
      (callDuration > 3 || connected) 
        ? "completed" 
        : (data.type === "out-going" ? "missed" : "rejected");
    saveCallLog(status);
    cleanup();
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: data.id });
    } else {
      socket.current.emit("reject-video-call", { from: data.id });
    }
    dispatch(EndCall());
  }, [cleanup, data, dispatch, socket, connected, callDuration, saveCallLog]);

  // Create peer connection and set up handlers
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("webrtc-ice-candidate", {
          to: data.id,
          from: UserInfo.id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      // Play remote audio
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play().catch(() => {});
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallStatus("Connected");
        setConnected(true);
        startTimer();
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [data.id, UserInfo.id, socket, startTimer, endCall]);

  // Outgoing call: wait for accept, then send offer
  useEffect(() => {
    if (data.type !== "out-going") return;

    const handleAccept = async () => {
      setCallStatus("Connecting...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.current.emit("webrtc-offer", {
          to: data.id,
          from: UserInfo.id,
          offer: offer,
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        setCallStatus("Failed");
        endCall();
      }
    };

    socket.current.on("accept-call", handleAccept);
    return () => {
      socket.current.off("accept-call", handleAccept);
    };
  }, [data, UserInfo.id, socket, createPeerConnection, endCall]);

  // Incoming call: wait for offer, send answer
  useEffect(() => {
    if (data.type !== "in-coming") return;

    const handleOffer = async ({ offer }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process queued ICE candidates
        for (const candidate of candidateQueue.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        candidateQueue.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.current.emit("webrtc-answer", {
          to: data.id,
          from: UserInfo.id,
          answer: answer,
        });
      } catch (err) {
        console.error("Failed to answer call:", err);
        endCall();
      }
    };

    socket.current.on("webrtc-offer", handleOffer);
    return () => {
      socket.current.off("webrtc-offer", handleOffer);
    };
  }, [data, UserInfo.id, socket, createPeerConnection, endCall]);

  // Handle answer (caller side)
  useEffect(() => {
    const handleAnswer = async ({ answer }) => {
      if (peerConnection.current && peerConnection.current.signalingState === "have-local-offer") {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        // Process queued ICE candidates
        for (const candidate of candidateQueue.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        candidateQueue.current = [];
      }
    };

    socket.current.on("webrtc-answer", handleAnswer);
    return () => {
      socket.current.off("webrtc-answer", handleAnswer);
    };
  }, [socket]);

  // Handle ICE candidates
  useEffect(() => {
    const handleCandidate = async ({ candidate }) => {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        candidateQueue.current.push(candidate);
      }
    };

    socket.current.on("webrtc-ice-candidate", handleCandidate);
    return () => {
      socket.current.off("webrtc-ice-candidate", handleCandidate);
    };
  }, [socket]);

  // Handle remote hang up
  useEffect(() => {
    const handleRejected = () => {
      cleanup();
      dispatch(EndCall());
    };

    socket.current.on("voice-call-rejected", handleRejected);
    socket.current.on("video-call-rejected", handleRejected);
    return () => {
      socket.current.off("voice-call-rejected", handleRejected);
      socket.current.off("video-call-rejected", handleRejected);
    };
  }, [socket, cleanup, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Auto-end outgoing call after 30s if not answered
  useEffect(() => {
    if (data.type === "out-going" && !connected) {
      ringTimeoutRef.current = setTimeout(() => {
        setCallStatus("Not answering");
        setTimeout(() => {
          endCall();
        }, 2000);
      }, 30000);
      return () => {
        if (ringTimeoutRef.current) {
          clearTimeout(ringTimeoutRef.current);
          ringTimeoutRef.current = null;
        }
      };
    }
  }, [data.type, connected, endCall]);

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-conversation-panel-background flex flex-col items-center justify-center text-white">
      {/* Caller info */}
      <div className="flex flex-col items-center gap-4 mb-auto mt-20">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teal-light">
          <Image
            src={data.profileImage || "/default_avatar.png"}
            alt={data.name || "User"}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-2xl font-light">{data.name}</h2>
        <p className="text-sm text-gray-400">
          {connected ? formatTime(callDuration) : callStatus}
        </p>
      </div>

      {/* Call controls */}
      <div className="flex items-center gap-8 mb-20">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? "bg-white text-gray-900" : "bg-gray-700 text-white"
          }`}
        >
          {isMuted ? <MdMicOff size={28} /> : <MdMic size={28} />}
        </button>
        <button
          onClick={endCall}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <MdCallEnd size={32} />
        </button>
      </div>
    </div>
  );
}

export default Container;
