import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("order-status", (data) => {
      if (data.status === "DELIVERED") toast("Commande livrée !");
      else if (data.status === "CANCELLED") toast("Commande annulée", "error");
      else toast(`Commande : ${data.status}`);
    });

    socket.on("new-order", (data) => {
      toast("Nouvelle commande reçue !", "error");
    });

    socket.on("delivery-assigned", () => {
      toast("Nouvelle livraison assignée !");
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  function joinOrder(orderId) {
    socketRef.current?.emit("join-order", orderId);
  }

  function leaveOrder(orderId) {
    socketRef.current?.emit("leave-order", orderId);
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinOrder, leaveOrder }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
