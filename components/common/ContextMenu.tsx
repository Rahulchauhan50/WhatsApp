import React, { useEffect, useRef } from "react";

function ContextMenu({ options , cordinate, contextMenu, setContextMenu}) {
  const contextMenuRef = useRef(null);

  useEffect(()=>{
    const handleoutside = (event) => {
      if(!event?.target?.className?.includes("context-openers")){
        if(contextMenuRef.current && !contextMenuRef.current.contains(event.target)){
          setContextMenu(false)
        }
      }
    }
    document.addEventListener("click", handleoutside);
    return () => {
      document.removeEventListener("click", handleoutside)
    }
  },[])

  const hadleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false)
    callback()
  }

  return <div ref={contextMenuRef} style={{top:cordinate.y,left:cordinate.x}} className={`bg-dropdown-background fixed py-2 z-[100] shadow-xl rounded-md`}>
    <ul>
      {options.map(({name, callback})=>{
        return <li key={name} className="px-5 py-2 hover:bg-background-default-hover cursor-pointer" onClick={(e)=>{hadleClick(e, callback)}}><span className="text-white">{name}</span></li>
      })}
    </ul>

  </div>;
}

export default ContextMenu;
