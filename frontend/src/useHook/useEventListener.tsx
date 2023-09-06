import React, { useRef, useEffect } from "react";

/*
  Call this to listening to events outside a react component
*/
export const useEventListenerUserInfo = (callback: any) => {
  const ref: React.MutableRefObject<any> = useRef();
  //run when useEventListener did load/update
  useEffect(() => {
    //create eventListener
    const eventFunction = (event: any) => {
      const arr = ref.current?.childBindings?.domNode?.childNodes;
      const length = arr.length;
      const target = event.target;
      //get the div parent from user option, in ListUser>UserInfo component
      const attributesTarget = target?.parentNode?.attributes;
      let i = 0;

      //loop whole list user array from event
      for (i = 0; i < length; ++i) {
        if (target && target.innerHTML === arr[i].textContent)
          break;
      }
      //will run handleClick in ListUser.tsx
      if (i >= length
        && attributesTarget?.class?.nodeValue !== "userInfo userInfoClick"
        && attributesTarget?.class?.nodeValue !== "adminBox")
        callback();
    }
    //listening to JS event
    document.addEventListener("click", eventFunction);
    return () => {
      document.removeEventListener("click", eventFunction)
    };
  }, [ref])
  return (ref);
}