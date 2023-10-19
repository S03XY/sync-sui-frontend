"use client";
import io, { Socket } from "socket.io-client";
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
} from "react";


const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketObj = io("ws://localhost:8080");
    setSocket(socketObj);
    return () => {
      socketObj.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const socket: Socket | null = useContext(SocketContext);
  return socket;
};
