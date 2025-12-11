import "../styles/home_page.css";
import Navbar from "../components/navbar";
import "../styles/fonts.css";
import Slider from "../components/slider";
import Footer from "../components/footer";
import bedroom from "../assets/bedroom.jpg";
import hall from "../assets/hall.jpg";
import kitchen from "../assets/kitchen.jpg";
import workroom from "../assets/workroom.jpg";
import wedding from "../assets/wedding.jpg";
import birthday from "../assets/birthday.jpg";
import caffee from "../assets/caffee.jpg";



export default function HomePage() {

  return (
    <div className="home-container">

      <Navbar/>

      {/* --- Header Text --- */}
      <div className="header-title">
        از جرقه <span className="red">رویا</span> تا نوازش <span className="red">هنر</span> ...!
      </div>

      {/* --- Main Images Section --- */}
      <div className="image-section">
        <div className="image-large">
          <div className="slider-wrapper-custom">
            <Slider
              images={[bedroom, hall, kitchen, workroom,wedding,birthday,caffee]}
              interval={3000}
              showDots={true}
              autoPlay={true}
            />
          </div>
        </div>
      </div>

    <Footer/>
    </div>
  );
}
