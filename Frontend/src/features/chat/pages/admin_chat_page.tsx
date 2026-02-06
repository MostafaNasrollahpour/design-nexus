import { useParams } from "react-router-dom";
import ChatBox from "./chatbox";

export default function AdminChatPage() {
  const { userId } = useParams<{ userId: string }>();

  // شناسه ثابت ادمین (می‌تونی از auth واقعی بیاری)
  const adminId = "admin123";

  return <ChatBox userId={adminId} isAdmin={true} currentChatUserId={userId || null} />;
}
