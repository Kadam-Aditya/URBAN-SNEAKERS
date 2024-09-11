import React, { useState, useEffect } from "react";
import "./Hero.css";
import home1 from "../Assets/Home1.png";
import home5 from "../Assets/Home2.png";

const images = [home1, home5];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0); 

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length); 
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="hero">
      <img
        src={images[currentImage]} 
        alt=""
        className="hero-image"
      />
    </div>
  );
};

export default Hero;
