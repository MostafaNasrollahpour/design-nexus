import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatBox from './chatbox';
import './admin_page.css';

type ActiveUserId = string | number;

type ServerToClientEvents = {
  active_users: (users: ActiveUserId[]) => void;
  connect_error: (err: Error) => void;
};

type ClientToServerEvents = {
  register: (payload: { userId: ActiveUserId; isAdmin: boolean }) => void;
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:4000', {
  reconnection: true,
  reconnectionAttempts: 5,
});

const AdminPanel: React.FC = () => {
  const isAdmin = true;
  const userId: ActiveUserId = 'admin123';

  const [activeChats, setActiveChats] = useState<ActiveUserId[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<ActiveUserId | null>(null);

  useEffect(() => {
    // ثبت ادمین با userId خودش
    socket.emit('register', {
      userId: userId,
      isAdmin,
    });

    // دریافت کاربران فعال
    socket.on('active_users', (users) => {
      setActiveChats(users);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    return () => {
      socket.off('active_users');
      socket.off('connect_error');
    };
  }, [userId]);

  return (
    <div className="admin-panel">
      <div className="chat-list">
        <h3>گفتگوهای فعال ({activeChats.length})</h3>

        {activeChats.length > 0 ? (
          activeChats.map((uId) => (
            <div
              key={String(uId)}
              onClick={() => setCurrentChatUserId(uId)}
              className={`chat-item ${currentChatUserId === uId ? 'active' : ''}`}
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
          <ChatBox userId={userId} isAdmin={true} currentChatUserId={currentChatUserId} />
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
