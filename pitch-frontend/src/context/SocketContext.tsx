"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";

const SocketContext = createContext<{
  socket: ReturnType<typeof socketio> | null;
}>({
  socket: null,
});

const getSocket = () => {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  return socketio(API_URL, {
    withCredentials: true,
    auth: { token },
  });
};

// Custom hook to access the socket instance from the context
const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(
    null
  );

  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    // Provide the socket instance through context to its children
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
