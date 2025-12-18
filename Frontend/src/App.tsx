import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/login_page";
import SignupPage from "./features/auth/pages/signup_page";
import PasswordResetPage from "./features/auth/pages/reset_password";
import VerifyCodePage from "./features/auth/pages/verify_email_page";
import VerifyToChangePassword from "./features/auth/pages/verify_to_change_password";
import ChangePasswordPage from "./features/auth/pages/change_password";
import HomePage from "./features/auth/pages/home_page";
import PanelPage from "./features/auth/pages/panel_page";
import SupportConsultPage from "./features/auth/pages/support_page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<PasswordResetPage />} />
        <Route path="/verify" element={<VerifyCodePage />} />
        <Route path="/verify-change-password" element={<VerifyToChangePassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route path="/" element={<HomePage />} />

        {/* ✅ بعد لاگین همینجا میاد (بدون تغییر HomePage) */}
        <Route path="/dashboard" element={<HomePage />} />

        {/* ✅ پنل کاربری */}
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/support" element={<SupportConsultPage />} />

      </Routes>
    </Router>
  );
}

export default App;

//---------------------------------------------------------------------------------
// import React from 'react';
// import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
// import Home from './features/chat/home';
// import AdminPanel from './features/chat/admin_page';



// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* <Route path='/' element={<Home />} /> */}
//         <Route path='/' element={<AdminPanel  />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;
//---------------------------------------------------------------------------------------

// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import LandingPage from './features/chat/landig';
// import ChatDashboardPage from './features/chat/chatDashboardPage';

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/chat" element={<ChatDashboardPage />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;


