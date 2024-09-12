import React, { useState, useEffect } from "react";
import "./Hero.css";
import home1 from "../Assets/Home1.png";
import home5 from "../Assets/Home2.png";

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState([home1, home5]); // Default for larger screens

  useEffect(() => {
    // Function to update images based on screen size
    const updateImagesForScreenSize = () => {
      if (window.innerWidth <= 768) {
        // For small screens, remove home5 from the array
        setImages([home1]);
      } else {
        // For larger screens, use both images
        setImages([home1, home5]);
      }
    };

    // Initial check for screen size
    updateImagesForScreenSize();

    // Add event listener to update on resize
    window.addEventListener("resize", updateImagesForScreenSize);

    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateImagesForScreenSize); // Cleanup the event listener
    };
  }, [images.length]); // Dependency on images length to update interval correctly

  return (
    <div className="hero">
      <img
        src={images[currentImage]} 
        alt="Hero" 
        className="hero-image"
      />
    </div>
  );
};

export default Hero;
