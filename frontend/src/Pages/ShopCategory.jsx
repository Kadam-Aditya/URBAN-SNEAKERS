import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";

const ShopCategory = (props) => {

  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = () => { 
    fetch('https://urban-sneakers-backend.onrender.com/allproducts') 
            .then((res) => res.json()) 
            .then((data) => setAllProducts(data))
    }

    useEffect(() => {
      fetchInfo();
    }, [])
    
  return (
    <div className="shopcategory">
      <div className="shopcategory-banner-container">
        <img src={props.banner} className="shopcategory-banner" alt="Shop Banner" />
        <div className="shopcategory-banner-text">
          <h1>FLAT 50% OFF</h1>
          <h2>Shop Our Latest Collection</h2>
          <p>Discover the best deals and newest arrivals</p>
          <button to="/shop" className="shop-now-button">Explore Now</button>
        </div>
        <div className="vertical-dashed-line"></div>
      </div>
      <div className="shopcategory-indexSort">
        <p><span>Showing 1 - 12</span> out of 54 Products</p>
        <div className="shopcategory-sort">Sort by  <img src={dropdown_icon} alt="" /></div>
      </div>
      <div className="shopcategory-products">
        {allproducts.map((item,i) => {
            if(props.category===item.category)
            {
              return <Item id={item.id} key={i} name={item.name} image={item.image}  new_price={item.new_price} old_price={item.old_price}/>;
            }
            else
            {
              return null;
            }
        })}
      </div>
      <div className="shopcategory-loadmore">
      <Link to='/' style={{ textDecoration: 'none' }}>Explore More</Link>
      </div>
    </div>
  );
};

export default ShopCategory;
