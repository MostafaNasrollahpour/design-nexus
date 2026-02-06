import React from 'react';
import ChatBox from './chatbox';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <ChatBox userId="USER_UNIQUE_ID" />
    </div>
  );
};

export default Home;
