import React from 'react';
import Home from './home';
import AdminPanel from './admin_page';
import ChatBox from './chatbox';
import './chat_dashboard_pade.css';

const ChatDashboardPage: React.FC = () => {
  return (
    <div className="dash-wrap">
      <div className="dash-col">
        <div className="dash-title">User Home</div>
        <Home />
      </div>

      <div className="dash-col">
        <div className="dash-title">Admin Panel</div>
        <AdminPanel />
      </div>

      <div className="dash-col">
        <div className="dash-title">Standalone ChatBox</div>
        <div className="home-container">
          <ChatBox userId="USER_UNIQUE_ID_STANDALONE" />
        </div>
      </div>
    </div>
  );
};

export default ChatDashboardPage;
