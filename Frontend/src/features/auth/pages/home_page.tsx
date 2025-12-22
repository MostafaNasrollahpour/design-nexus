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

// ✅ اضافه شد: API مربوط به دسته‌بندی‌ها
import { getPortfoliosByCategoryId } from "../../view/API/category_view_API";
import type { PortfolioListItem } from "../../view/API/category_view_API";

// ✅ اضافه شد: مپ slug های اسلایدر به categoryId های بک‌اند/صفحه
const CATEGORY_SLUG_TO_ID: Record<string, number> = {
  bedroom: 1,
  hall: 2,
  kitchen: 3,
  workroom: 4,
  wedding: 5,
  birthday: 6,
  caffee: 7,
};

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

  const onSlideAction = async (slide: Slide, _index: number) => {
    const categoryId = CATEGORY_SLUG_TO_ID[slide.actionKey];

    if (!categoryId) {
      alert("دسته‌بندی ناشناخته است.");
      return;
    }

    const items: PortfolioListItem[] = await getPortfoliosByCategoryId(categoryId);

    navigate(`/category/${categoryId}`, {
      state: {
        pageData: {
          categoryId,
          items,
        },
      },
    });
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
