import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './chatbox.css';

type SenderType = 'admin' | 'user';

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
};

type ServerToClientEvents = {
  message_history: (history: ChatMessage[]) => void;
  new_message: (msg: ChatMessage) => void;
  active_users: (users: Array<string | number>) => void;
};

type ClientToServerEvents = {
  register: (payload: RegisterPayload) => void;
  send_message: (payload: SendMessagePayload) => void;
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:4000');

function ChatBox({ userId, isAdmin = false, currentChatUserId = null }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<Array<string | number>>([]);

  // کاربر هدف برای ارسال و دریافت پیام‌ها
  const targetUserId = isAdmin ? currentChatUserId : userId;

  const sendMessage = () => {
    if (input.trim() && targetUserId) {
      const newMsg: ChatMessage = {
        text: input,
        sender: isAdmin ? 'admin' : 'user',
        timestamp: new Date().toISOString(),
        id: Date.now(), // شناسه یکتا
      };

      setMessages(prev => [...prev, newMsg]);

      socket.emit('send_message', {
        ...newMsg,
        userId: targetUserId,
      });

      setInput('');
    }
  };

  useEffect(() => {
    if (!targetUserId) return;

    setMessages([]);

    socket.emit('register', {
      userId,
      isAdmin,
      currentChatUserId: isAdmin ? currentChatUserId : null,
    });

    socket.off('message_history');
    socket.off('new_message');
    socket.off('active_users');

    socket.on('message_history', (history) => {
      setMessages(history);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    if (isAdmin) {
      socket.on('active_users', (users) => {
        setActiveUsers(users);
      });
    }

    return () => {
      socket.off('message_history');
      socket.off('new_message');
      socket.off('active_users');
    };
  }, [targetUserId, userId, isAdmin, currentChatUserId]);

  if (isAdmin && !currentChatUserId) {
    return (
      <div className="admin-chat-selector">
        <h3>گفتگوهای فعال</h3>
        {activeUsers.length > 0 ? (
          <ul>
            {activeUsers.map((uId) => (
              <li
                key={String(uId)}
                onClick={() => (window.location.href = `/admin/chat/${uId}`)}
              >
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        {isAdmin ? `پشتیبانی - کاربر #${targetUserId}` : 'پشتیبانی آنلاین'}
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
          >
            <div>{msg.text}</div>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
          placeholder="پیام خود را بنویسید..."
        />
        <button className="send-button" onClick={sendMessage}>
          ارسال
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
