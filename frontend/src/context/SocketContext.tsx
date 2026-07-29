import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { createCloudiSocket } from '@/lib/socket';

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    const instance = createCloudiSocket(token);
    socketRef.current = instance;
    setSocket(instance);

    return () => {
      instance.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = (): Socket | null => useContext(SocketContext).socket;
