import React from "react";
import "./Offers.css";
import home5 from "../Assets/Home4.jfif";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <img
          src={home5}
          alt="Exclusive offers"
          className="offers-image"
        />
        <h1>Exclusive</h1>
        <h1>Offers For You</h1>
        <p>ONLY ON BEST SELLERS PRODUCTS</p>
        <button className="offers-button">Check now</button>
      </div>
    </div>
  );
};

export default Offers;
