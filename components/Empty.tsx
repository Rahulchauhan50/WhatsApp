import React from "react";
import Image from "next/image";

function Empty() {
  return <div className="border-conversation-border border-l w-full bg-[#222E35] md:flex hidden flex-col h-[100vh] border-b-4  items-center justify-center" >
    {/* <Image src='/empty.png' alt='whastapp' height={300} width={300} /> */}
    <img src="/empty.png" className="w-full" ></img>
  </div>;
}

export default Empty;
