import "../styles/home_page.css";

import Navbar from "../../../shared/components/navbar";
import Slider, { type Slide } from "../components/slider";
import Footer from "../../../shared/components/footer";

import bedroom from "../assets/bedroom.jpg";
import hall from "../assets/hall.jpg";
import kitchen from "../assets/kitchen.jpg";
import workroom from "../assets/workroom.jpg";
import wedding from "../assets/wedding.jpg";
import birthday from "../assets/birthday.jpg";
import caffee from "../assets/caffee.jpg";

import { useNavigate } from "react-router-dom";
import { resolveSlide } from "../API/authAPI"; // مسیر همون فایل API خودت

type PageData = any;

export default function HomePage() {
  const navigate = useNavigate();

  const slides: Slide[] = [
    { src: bedroom, buttonText: "اتاق خواب", actionKey: "bedroom" },
    { src: hall, buttonText: "پذیرایی", actionKey: "hall" },
    { src: kitchen, buttonText: "آشپزخانه", actionKey: "kitchen" },
    { src: workroom, buttonText: "اتاق کار", actionKey: "workroom" },
    { src: wedding, buttonText: "عروسی و نامزدی", actionKey: "wedding" },
    { src: birthday, buttonText: "جشن تولد", actionKey: "birthday" },
    { src: caffee, buttonText: "کافی‌شاپ و رستوران", actionKey: "caffee" },
  ];

  // ✅ حالا کاملاً با resolveSlide مچ شد
  const onSlideAction = async (slide: Slide, _index: number) => {
    const { route, pageData } = await resolveSlide<PageData>(slide.actionKey);
    navigate(route, { state: { pageData } });
  };

  return (
    <div className="home-container">
      <Navbar />

      <div className="header-title">
        از جرقه <span className="red">رویا</span> تا نوازش{" "}
        <span className="red">هنر</span> ...!
      </div>

      <Slider slides={slides} interval={3000} showDots autoPlay onSlideAction={onSlideAction} />

      <Footer />
    </div>
  );
}
