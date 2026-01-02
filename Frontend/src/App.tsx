import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./features/auth/pages/login_page";
import SignupPage from "./features/auth/pages/signup_page";
import PasswordResetPage from "./features/auth/pages/reset_password";
import VerifyCodePage from "./features/auth/pages/verify_email_page";
import VerifyToChangePassword from "./features/auth/pages/verify_to_change_password";
import ChangePasswordPage from "./features/auth/pages/change_password";
import HomePage from "./features/auth/pages/home_page";
import PanelPage from "./features/media/pages/panel_page";
import SupportConsultPage from "./features/support/pages/support_page";
import UserChatPage from "./features/chat/user_chat_page";
import AdminChatPage from "./features/chat/admin_chat_page";
import CategoryPortfoliosPage from "./features/view/pages/category_view";
import PortfolioDetailsPage from "./features/view/pages/profile_details";
import DesignerListPage from "./features/view/pages/designer_list_page";
import PortfolioEditPage from "./features/view/pages/edit_design";
import DesignerDetailsPage from "./features/view/pages/designer_details"; 
import OrderFormPage from "./features/ordering/pages/order_form"; // ✅ اضافه شد

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<HomePage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<PasswordResetPage />} />
        <Route path="/verify" element={<VerifyCodePage />} />
        <Route path="/verify-change-password" element={<VerifyToChangePassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* View */}
        <Route path="/designers" element={<DesignerListPage />} />
        <Route path="/designer-details/:designerId" element={<DesignerDetailsPage />} /> 

        {/* ✅ صفحه فرم سفارش */}
        <Route path="/designer-details/:designerId/order" element={<OrderFormPage />} />

        {/* Category Portfolios */}
        <Route path="/category/:categoryId" element={<CategoryPortfoliosPage />} />

        {/* Chat */}
        <Route path="/chat/:designerId?" element={<UserChatPage />} />
        <Route path="/admin/chat/:userId" element={<AdminChatPage />} />

        {/* User Panel */}
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/support" element={<SupportConsultPage />} />

        {/* Portfolio */}
        <Route path="/portfolio/:id" element={<PortfolioDetailsPage />} />
        <Route path="/portfolio/edit/:id" element={<PortfolioEditPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
