import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatBox from "./chatbox";
import "./admin_page.css";

type ActiveUserId = string | number;

type ServerToClientEvents = {
  active_users: (users: ActiveUserId[]) => void;
  connect_error: (err: Error) => void;
};

type ClientToServerEvents = {
  register: (payload: { userId: ActiveUserId; isAdmin: boolean; currentChatUserId?: ActiveUserId | null }) => void;
};

const SOCKET_URL = (import.meta as any)?.env?.VITE_CHAT_SOCKET_URL || "http://localhost:4000";

const AdminPanel: React.FC = () => {
  const isAdmin = true;
  const adminId: ActiveUserId = "admin123";

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  const socket = socketRef.current;

  const [activeChats, setActiveChats] = useState<ActiveUserId[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<ActiveUserId | null>(null);

  useEffect(() => {
    socket.emit("register", { userId: adminId, isAdmin });

    const onActiveUsers = (users: ActiveUserId[]) => setActiveChats(users);
    const onConnectError = (err: Error) => console.error("Admin socket error:", err);

    socket.on("active_users", onActiveUsers);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("active_users", onActiveUsers);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="admin-panel">
      <div className="chat-list">
        <h3>گفتگوهای فعال ({activeChats.length})</h3>

        {activeChats.length > 0 ? (
          activeChats.map((uId) => (
            <div
              key={String(uId)}
              onClick={() => setCurrentChatUserId(uId)}
              className={`chat-item ${currentChatUserId === uId ? "active" : ""}`}
            >
              <span>کاربر #{uId}</span>
              <span className="status-indicator"></span>
            </div>
          ))
        ) : (
          <p>هیچ گفتگوی فعالی وجود ندارد</p>
        )}
      </div>

      <div className="chat-container">
        {currentChatUserId ? (
          <ChatBox userId={adminId} isAdmin={true} currentChatUserId={currentChatUserId} />
        ) : (
          <div className="select-chat-prompt">
            <p>لطفاً یک گفتگو از لیست انتخاب کنید</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
