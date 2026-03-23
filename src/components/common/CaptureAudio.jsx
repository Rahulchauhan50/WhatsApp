import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {FaMicrophone,FaPauseCircle,FaPlay,FaStop,FaTrash} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import { useDispatch, useSelector } from "react-redux";
import { setAddMessages } from "@/redux/features/userSlice";


function CaptureAudio({ hide, socket}) {
  const dispatch = useDispatch();
  const { UserInfo } = useSelector((state) => state.user);
  const { CurrentChatUser } = useSelector((state) => state.user);

  const [IsRecording, setIsRecording] = useState(false);
  const [RecordedAudio, setRecordedAudio] = useState(null);
  const [waveForm, setWaveForm] = useState(null);
  const [RecordingDuration, setRecordingDuration] = useState(0);
  const [CurrentPlayBackTime, setCurrentPlayBackTime] = useState(0);
  const [TotalDuration, setTotalDuration] = useState(0);
  const [IsPlaying, setIsPlaying] = useState(false);
  const [renderAudio, setrenderAudio] = useState(null);

  const AudioRef = useRef(null);
  const MediaRecorderRef = useRef(null);
  const WaveFormRef = useRef(null);
  const chunksRef = useRef([]);

  // Recording duration timer
  useEffect(()=>{
    let interval;
    if(IsRecording){
      interval = setInterval(() => {
        setRecordingDuration((prev)=>{
          setTotalDuration(prev+1);
          return prev+1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  },[IsRecording]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setTotalDuration(0);
    setCurrentPlayBackTime(0);
    setIsRecording(true);
    setrenderAudio(null);
    chunksRef.current = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      MediaRecorderRef.current = mediaRecorder;
      AudioRef.current.srcObject = stream;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/ogg; codecs=opus" });
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        setRecordedAudio(audio);

        const audioFile = new File([blob], "recording.mp3", { type: "audio/mp3" });
        setrenderAudio(audioFile);

        waveForm.load(audioURL);

        // Stop all mic tracks
        const mediaStream = AudioRef.current?.srcObject;
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          AudioRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
    }).catch(error => {
      console.error("Error accessing microphone:", error);
    });
  };

  const handleStopRecording = () => {
    if(MediaRecorderRef.current && IsRecording){
      MediaRecorderRef.current.stop();
      setIsRecording(false);
      waveForm.stop();
    }
  };

  const handlePlayRecording = () => {
    if(RecordedAudio){
      waveForm.stop();
      waveForm.play();
      RecordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    waveForm.stop();
    RecordedAudio.pause();
    setIsPlaying(false);
  };

  const sendRecording = async () => {
    try {
      if (!renderAudio) return;

      const formData = new FormData();
      formData.append("audio", renderAudio);

      const resopnse = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: UserInfo.id,
          to: CurrentChatUser.id,
        },
      });
      if (resopnse.status === 201) {
        dispatch(
          setAddMessages({
            senderId: UserInfo?.id,
            message: resopnse.data.message.message,
            recieverId: CurrentChatUser?.id,
            type: "audio",
            createdAt: Date.now(),
            messageStatus: resopnse.data.message.messageStatus,
          })
        );
        socket.current.emit("send-msg", {
          senderId: UserInfo?.id,
          message: resopnse.data.message.message,
          recieverId: CurrentChatUser?.id,
          type: "audio",
          createdAt: Date.now(),
          messageStatus: resopnse.data.message.messageStatus,
        });
      }
      hide(false);
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Auto-start recording when waveform is ready
  useEffect(() => {
    if (waveForm) handleStartRecording();
  }, [waveForm]);

  // Playback time tracking
  useEffect(()=>{
    if(RecordedAudio){
      const updatePlayBackTime = () => {
        setCurrentPlayBackTime(RecordedAudio.currentTime);
      };
      RecordedAudio.addEventListener("timeupdate", updatePlayBackTime);
      return () => {
        RecordedAudio.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [RecordedAudio]);

  // Initialise WaveSurfer
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: WaveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });
    setWaveForm(wavesurfer);

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  },[]);

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      if (AudioRef.current?.srcObject) {
        AudioRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);


  return (
    <div className="flex text-lg md:text-2xl w-full items-center gap-2 md:gap-3">
      {/* Delete / Trash */}
      <button
        onClick={() => hide(false)}
        className="shrink-0 p-2 rounded-full hover:bg-[#2a3942] transition-colors"
      >
        <FaTrash className="text-panel-header-icon text-base md:text-xl" />
      </button>

      {/* Recording / Waveform bar */}
      <div className="flex-1 min-w-0 py-2 px-3 md:px-4 text-white text-sm md:text-lg flex gap-2 md:gap-3 items-center bg-search-input-container-background rounded-full">
        {IsRecording ? (
          <div className="text-red-500 animate-pulse text-center flex-1 truncate">
            Recording <span>{RecordingDuration}s</span>
          </div>
        ) : (
          <>
            {RecordedAudio && (
              <button className="shrink-0" onClick={!IsPlaying ? handlePlayRecording : handlePauseRecording}>
                {!IsPlaying ? <FaPlay className="text-sm md:text-base" /> : <FaStop className="text-sm md:text-base" />}
              </button>
            )}
          </>
        )}
        <div className="flex-1 min-w-0" ref={WaveFormRef} hidden={IsRecording} />
        {RecordedAudio && IsPlaying && (
          <span className="text-xs md:text-sm shrink-0">{formatTime(CurrentPlayBackTime)}</span>
        )}
        {RecordedAudio && !IsPlaying && (
          <span className="text-xs md:text-sm shrink-0">{formatTime(TotalDuration)}</span>
        )}
        <audio ref={AudioRef} hidden />
      </div>

      {/* Record / Stop toggle */}
      <button
        onClick={!IsRecording ? handleStartRecording : handleStopRecording}
        className="shrink-0 p-2 rounded-full hover:bg-[#2a3942] transition-colors"
      >
        {!IsRecording ? (
          <FaMicrophone className="text-red-500 text-base md:text-xl" />
        ) : (
          <FaPauseCircle className="text-red-500 text-base md:text-xl" />
        )}
      </button>

      {/* Send */}
      <button
        onClick={sendRecording}
        disabled={!renderAudio}
        className={`shrink-0 p-2 rounded-full transition-colors ${
          renderAudio ? "hover:bg-[#2a3942] cursor-pointer" : "opacity-40 cursor-not-allowed"
        }`}
        title="Send"
      >
        <MdSend className="text-panel-header-icon text-base md:text-xl" />
      </button>
    </div>
  );
}

export default CaptureAudio;
