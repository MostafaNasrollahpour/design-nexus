import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../styles/chatbox.css";

type SenderType = "admin" | "user";

type ChatMessage = {
  text: string;
  sender: SenderType;
  timestamp: string;
  id: number;
  userId?: string | number;
};

type RegisterPayload = {
  userId: string | number;
  isAdmin: boolean;
  currentChatUserId: string | number | null;
};

type SendMessagePayload = ChatMessage & { userId: string | number };

type ChatBoxProps = {
  userId: string | number;
  isAdmin?: boolean;
  currentChatUserId?: string | number | null;

  /** فقط برای UI (اختیاری) */
  headerTitle?: string;
};

type ServerToClientEvents = {
  message_history: (history: ChatMessage[]) => void;
  new_message: (msg: ChatMessage) => void;
  active_users: (users: Array<string | number>) => void;
  connect_error: (err: Error) => void;
};

type ClientToServerEvents = {
  register: (payload: RegisterPayload) => void;
  send_message: (payload: SendMessagePayload) => void;
};

const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "") + "/chat";

function ChatBox({ userId, isAdmin = false, currentChatUserId = null, headerTitle }: ChatBoxProps) {
  const navigate = useNavigate();

  // ✅ برای جلوگیری از تداخل، هر ChatBox یک socket مستقل دارد
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState<Array<string | number>>([]);

  // کاربر هدف برای ارسال و دریافت پیام‌ها
  const targetUserId = useMemo(() => (isAdmin ? currentChatUserId : userId), [isAdmin, currentChatUserId, userId]);

  const sendMessage = () => {
    if (!input.trim() || !targetUserId) return;

    const newMsg: ChatMessage = {
      text: input,
      sender: isAdmin ? "admin" : "user",
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    // optimistic UI
    setMessages((prev) => [...prev, newMsg]);

    socket.emit("send_message", {
      ...newMsg,
      userId: targetUserId,
    });

    setInput("");
  };

  useEffect(() => {
    if (!targetUserId) return;

    setMessages([]);

    // register برای همین گفتگو
    socket.emit("register", {
      userId,
      isAdmin,
      currentChatUserId: isAdmin ? currentChatUserId : null,
    });

    const onHistory = (history: ChatMessage[]) => {
      setMessages(history);
    };

    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onActiveUsers = (users: Array<string | number>) => {
      setActiveUsers(users);
    };

    const onConnectError = (err: Error) => {
      // فقط لاگ برای دیباگ
      console.error("Socket connect_error:", err);
    };

    socket.on("message_history", onHistory);
    socket.on("new_message", onNewMessage);
    socket.on("connect_error", onConnectError);

    if (isAdmin) socket.on("active_users", onActiveUsers);

    return () => {
      socket.off("message_history", onHistory);
      socket.off("new_message", onNewMessage);
      socket.off("connect_error", onConnectError);
      if (isAdmin) socket.off("active_users", onActiveUsers);
    };
  }, [socket, targetUserId, userId, isAdmin, currentChatUserId]);

  // بستن سوکت هنگام unmount همین ChatBox
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  if (isAdmin && !currentChatUserId) {
    return (
      <div className="admin-chat-selector">
        <h3>گفتگوهای فعال</h3>

        {activeUsers.length > 0 ? (
          <ul>
            {activeUsers.map((uId) => (
              <li key={String(uId)} onClick={() => navigate(`/admin/chat/${uId}`)}>
                چت با کاربر #{uId}
              </li>
            ))}
          </ul>
        ) : (
          <p>هیچ گفتگوی فعالی وجود ندارد</p>
        )}
      </div>
    );
  }

  const headerText = headerTitle || (isAdmin ? `پشتیبانی - کاربر #${targetUserId}` : "پشتیبانی آنلاین");

  return (
    <div className="chat-container">
      <div className="chat-header">{headerText}</div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === "user" ? "user-message" : "admin-message"}`}>
            <div>{msg.text}</div>
            <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && sendMessage()}
          placeholder="پیام خود را بنویسید..."
        />
        <button className="send-button" onClick={sendMessage} disabled={!input.trim()}>
          ارسال
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
