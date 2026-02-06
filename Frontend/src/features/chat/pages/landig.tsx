import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-card">
        <h2>صفحه فرمالیته</h2>
        <p>برای ورود به صفحه چت روی دکمه زیر کلیک کنید.</p>

        <button className="landing-btn" onClick={() => navigate('/chat')}>
          ورود به صفحه چت
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
