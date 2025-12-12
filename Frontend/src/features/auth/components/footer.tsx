import React from "react";
import "../styles/footer.css";

import instagramIcon from "../assets/icons8-instagram-48.png";
import emailIcon from "../assets/icons8-email-48.png";
import phoneIcon from "../assets/icons8-phone-48.png";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__header">
          <span className="footer__title">تماس با ما</span>
        </div>

        <div className="footer__contacts">
          <a
            href="https://instagram.com/design_nexus"
            target="_blank"
            rel="noreferrer"
            className="footer__contact"
          >
            <img src={instagramIcon} alt="اینستاگرام" className="footer__icon" />
            <span className="footer__text">@design_nexus</span>
          </a>

          <a href="mailto:designNexus@gmail.com" className="footer__contact">
            <img src={emailIcon} alt="ایمیل" className="footer__icon" />
            <span className="footer__text">designNexus@gmail.com</span>
          </a>

          <a href="tel:011567849" className="footer__contact">
            <img src={phoneIcon} alt="تلفن" className="footer__icon" />
            <span className="footer__text">011 567 849</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
