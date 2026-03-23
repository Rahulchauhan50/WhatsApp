import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useSelector } from "react-redux";
import Avatar from "../common/Avatar";
import MessageStatus from "../common/MessageStatus";
import {FaPlay,FaStop} from "react-icons/fa";
import { HOST } from "@/utils/ApiRoutes";

function VoiceMessage({ message }) {
  
  const { UserInfo } = useSelector((state) => state.user);
  const { CurrentChatUser } = useSelector((state) => state.user);

  const [CurrentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [TotalDuration, setTotalDuration] = useState(0);
  const [audioMessage, setaudioMessage] = useState(null);
  const [IsPlaying, setIsPlaying] = useState(false);

  const WaveFormRef = useRef(null);
  const WaveForm = useRef(null);

  const handlePlayAudio = () => {
    if (audioMessage) {
      console.log(audioMessage)
      WaveForm.current.stop();
      WaveForm.current.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };
  const handlePauseAudio = () => {
    WaveForm.current.stop();
    audioMessage.pause();
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const audioURL = message.message.startsWith("http") ? message.message : `${HOST}/${message.message}`;
  
    const audio = new Audio(audioURL);
    setaudioMessage(audio);
  
    if (WaveFormRef.current) {
      if (WaveFormRef.current !== null) {
        if (WaveFormRef.current !== undefined) {
          WaveFormRef.current.innerHTML = ''; // Clear any previous content
          WaveForm.current = WaveSurfer.create({
            container: WaveFormRef.current,
            waveColor: "#ccc",
            progressColor: "#4a9eff",
            cursorColor: "#7ae3c3",
            barWidth: 2,
            height: 30,
            responsive: true,
          });
  
          WaveForm.current.on("finish", () => {
            setIsPlaying(false);
          });
  
          WaveForm.current.load(audioURL);
          WaveForm.current.on("ready", () => {
            setTotalDuration(WaveForm.current.getDuration());
          });
        }
      }
    }
  
    return () => {
      if (WaveForm.current) {
        WaveForm.current.destroy();
      }
    };
  }, [message.message]);
  

  useEffect(() => {
    if (WaveForm.current === null) {
      WaveForm.current = WaveSurfer.create({
        container: WaveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      WaveForm.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    return () => {
      WaveForm.current.destroy();
    };
  }, []);

  useEffect(() => {
    console.log(message)
    const audioURL = message.message.startsWith("http") ? message.message : `${HOST}/${message.message}`;
    console.log(audioURL)
    const audio = new Audio(audioURL);
    setaudioMessage(audio);
    WaveForm.current.load(audioURL);
    WaveForm.current.on("ready", () => {});
    setTotalDuration( WaveForm.current.getDuration());
  }, [message.message]);

  const getTime = (date) => {
    const dateObject = new Date(date);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return dateObject.toLocaleString('en-US', options);
  };

  return <div  className={`flex items-center gap-3 text-white px-3 pr-2 py-3 text-sm rounded-md w-[300px] max-w-[85vw] ${
    message.senderId === CurrentChatUser.id
      ? "bg-incoming-background"
      : "bg-outgoing-background"
  }`}>
    <div className="cursor-pointer text-xl shrink-0" >
                {!IsPlaying ? (
                  <FaPlay onClick={handlePlayAudio} />
                ) : (
                  <FaStop onClick={handlePauseAudio} />
                )}
    </div>
    <div className="relative flex-1 min-w-0">
    <div className="w-full" ref={WaveFormRef} />
    <div className="text-bubble-meta text-[11px] pt-1 flex justify-between w-full" >
      <span>{formatTime(IsPlaying?CurrentPlayBackTime:TotalDuration)}</span>
      <div className="flex items-end gap-1">
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
  </div>;
}

export default VoiceMessage;