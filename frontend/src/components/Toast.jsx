import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function Toast({ message, type = "error", onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Use a ref to store the latest onClose callback to prevent the
  // auto-dismiss timer from resetting when the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    console.log(`[Toast] Mounted under body: type=${type}, message=`, message);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onCloseRef.current) onCloseRef.current();
    }, 3000); // Auto-dismiss after 3 seconds

    return () => {
      console.log(`[Toast] Unmounting/Clearing timer`);
      clearTimeout(timer);
    };
  }, [type, message]); // Stable: doesn't depend on onClose

  if (!isVisible) return null;

  const isError = type === "error";
  const isSuccess = type === "success";

  // Using vibrant, high-contrast solid colors for maximum visibility on all backgrounds
  const themeClasses = isError
    ? "bg-red-600 text-white border-red-700 shadow-red-900/20"
    : isSuccess
    ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/20"
    : "";

  const displayMessage = typeof message === "string" 
    ? message 
    : (message?.message || JSON.stringify(message));

  const mountNode = typeof document !== "undefined" ? document.body : null;
  const toastElement = (
    <div
      className={`fixed top-6 right-6 max-w-sm px-6 py-4 rounded-lg shadow-xl border animate-slide-in-right z-[9999] ${themeClasses}`}
      style={{ minWidth: "280px" }}
    >
      <div className="flex items-center gap-3 text-left">
        <div className="text-2xl flex-shrink-0">
          {isError && "❌"}
          {isSuccess && "✅"}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm my-0 leading-tight text-white">
            {isError ? "Login Failed" : "Login Successful"}
          </p>
          <p className="text-xs opacity-90 mt-1 mb-0 text-white">
            {displayMessage}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onCloseRef.current) onCloseRef.current();
          }}
          className="text-lg opacity-80 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer text-white outline-none p-0 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return mountNode ? createPortal(toastElement, mountNode) : toastElement;
}

export default Toast;
