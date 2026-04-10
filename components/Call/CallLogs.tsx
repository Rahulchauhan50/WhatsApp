import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { GET_CALL_LOGS_ROUTE } from "@/utils/ApiRoutes";
import { BsTelephoneFill } from "react-icons/bs";
import { MdCall, MdCallMade, MdCallReceived, MdCallMissed, MdVideocam } from "react-icons/md";
import { setCurrentChatUser, setMessages, setActiveTab } from "@/redux/features/userSlice";
import Avatar from "../common/Avatar";
import { calculateTime } from "@/utils/CalculateTime";

function CallLogs() {
  const { UserInfo } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCallLogs = async () => {
    if (!UserInfo?.id) return;
    try {
      const { data } = await axios.get(`${GET_CALL_LOGS_ROUTE}/${UserInfo.id}`);
      console.log("Fetched call logs:", data);
      setCallLogs(data?.calls || []);
    } catch (err) {
      console.error("Failed to fetch call logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, [UserInfo?.id]);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleCallClick = (call: any) => {
    const isOutgoing = call.senderId === UserInfo.id;
    const otherUser = isOutgoing ? call.reciever : call.sender;
    dispatch(setMessages({ data: { message: [] } }));
    dispatch(setCurrentChatUser({ data: otherUser }));
    dispatch(setActiveTab("chat"));
  };

  type GroupedCalls = {
    [key: string]: { label: string; calls: any[]; sortKey: string };
  };

  const groupCallsByDate = (calls: any[]) => {
    const grouped: GroupedCalls = {};
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    calls.forEach((call) => {
      let dateKey, dateLabel;
      try {
        const d = new Date(call.createdAt);
        if (isNaN(d.getTime())) throw new Error("Invalid date");
        dateKey = d.toISOString().split("T")[0];
        
        if (dateKey === today) {
          dateLabel = "Today";
        } else if (dateKey === yesterday) {
          dateLabel = "Yesterday";
        } else {
          dateLabel = d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }
      } catch {
        dateKey = "unknown";
        dateLabel = "Recent";
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { label: dateLabel, calls: [], sortKey: dateKey };
      }
      grouped[dateKey].calls.push(call);
    });
    return Object.values(grouped).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  };

  const groupedLogs = callLogs.length > 0 ? groupCallsByDate(callLogs) : [];

  return (
    <div className="flex flex-col h-full bg-search-input-container-background">
      {/* Header */}
      <div className="bg-panel-header-background h-16 flex items-center px-4">
        <span className="text-white font-medium text-lg">Calls</span>
      </div>

      {/* Call list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-width-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-secondary text-sm">Loading calls...</span>
          </div>
        ) : callLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 h-full">

            <BsTelephoneFill size={56} className="text-secondary mb-4 opacity-50" />
            <p className="text-secondary text-sm">No recent calls</p>
            <p className="text-secondary text-xs mt-1">
              Your call history will appear here
            </p>
          </div>
        ) : (
          groupedLogs.map((group) => (
            <div key={group.label}>

              {/* Date header */}
              <div className="px-4 py-3 sticky top-0 bg-panel-header-background/50 backdrop-blur">
                <span className="text-xs font-medium text-secondary uppercase">{group.label}</span>
              </div>
              {/* Calls for this date */}
              {group.calls.map((call: any) => {

                let callData: { callType?: string; duration?: number; status?: string } = {};
                try {
                  callData = JSON.parse(call.message);
                } catch {
                  callData = { callType: "voice", duration: 0, status: "missed" };
                }

                const isOutgoing = call.senderId === UserInfo.id;
                const isMissed = callData.status === "missed" || callData.status === "rejected";
                const isVideo = callData.callType === "video";
                const otherUser = isOutgoing ? call.reciever : call.sender;

                return (
                  <div
                    key={call.id}
                    onClick={() => handleCallClick(call)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-background-default-hover active:bg-background-default-hover cursor-pointer border-b border-conversation-border transition-colors"
                  >
                  <Avatar type="sm" image={otherUser?.profileImage || "/default_avatar.png"} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMissed && !isOutgoing ? "text-red-400" : "text-white"}`}>
                        {otherUser?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        {isMissed ? (
                          <MdCallMissed className="text-red-500 flex-shrink-0" size={14} />
                        ) : isOutgoing ? (
                          <MdCallMade className="text-green-500 flex-shrink-0" size={14} />
                        ) : (
                          <MdCallReceived className="text-green-500 flex-shrink-0" size={14} />
                        )}
                        <span className="truncate">
                          {new Date(call.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {callData.duration && callData.duration > 0 && ` · ${formatDuration(callData.duration)}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-secondary">
                        {isVideo ? "Video" : "Voice"}
                      </span>
                      {isVideo ? (
                        <MdVideocam className="text-teal-light" size={20} />
                      ) : (
                        <MdCall className="text-teal-light" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CallLogs;
