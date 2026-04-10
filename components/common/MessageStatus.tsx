import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({messageStatus}) {
  return <>
{messageStatus === "sent" && <BsCheck className="text-lg min-w-[20px]"  />}
{messageStatus === "delivered" && <BsCheckAll className="text-lg min-w-[20px]"  />}
{messageStatus === "read" && <BsCheckAll className="text-lg text-icon-ack min-w-[20px]"  />}
  </>
}

export default MessageStatus;
