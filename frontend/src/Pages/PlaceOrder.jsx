import React, { useContext, useState, useEffect } from 'react';
import "./CSS/PlaceOrder.css";
import { ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { backend_url } from '../App.js';

const PlaceOrder = () => {
  const { getTotalCartAmount, getTotalCartItemsId } = useContext(ShopContext);
  const currency = '₹';
  const navigate = useNavigate();
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.log("Razorpay script failed to load");
    };
    document.body.appendChild(script);
  }, []);

  const [orderData, setOrderData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const zipCodePattern = /^[1-9][0-9]{5}$/;
    let errors = {};

    // Validate ZIP code for India
    if (!zipCodePattern.test(orderData.zip)) {
      errors.zip = "The zip code should be 6 digits";
    }

    // Additional validations
    if (!orderData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!orderData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(orderData.email)) {
      errors.email = "Email address is invalid.";
    }

    if (!orderData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(orderData.phone)) {
      errors.phone = "The phone number should be 10 digits";
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.error("Validation errors:", errors);
      return;
    }

    const totalAmount = getTotalCartAmount();
    const items = getTotalCartItemsId();
    const token = localStorage.getItem("auth-token");

    if (!token) {
      console.error("No auth token found. Please log in.");
      return;
    }

    const response = await fetch(`${backend_url}/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      },
      body: JSON.stringify({
        items,
        amount: totalAmount,
        address: orderData
      })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('showPopup', 'true');
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        name: 'E-commerce Website',
        description: 'Test Transaction',
        order_id: data.order_id,
        handler: function (response) {
          navigate('/myorders');
        },
        prefill: {
          name: `${orderData.firstName} ${orderData.lastName}`,
          email: orderData.email,
          contact: orderData.phone
        },
        notes: {
          address: `${orderData.street}, ${orderData.city}`
        },
        theme: {
          color: '#F37254'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Order Failed!');
    }
  };

  return (
    <form className='place-order' onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            type="text"
            placeholder='First name'
            name="firstName"
            value={orderData.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
          <input
            type="text"
            placeholder='Last name'
            name="lastName"
            value={orderData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          placeholder='Email address'
          name="email"
          value={orderData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
        <input
          type="text"
          placeholder='Street'
          name="street"
          value={orderData.street}
          onChange={handleChange}
          required
        />
        <div className="multi-fields">
          <input
            type="text"
            placeholder='City'
            name="city"
            value={orderData.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder='State'
            name="state"
            value={orderData.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            placeholder='Zip code'
            name="zip"
            value={orderData.zip}
            onChange={handleChange}
            required
          />
          {errors.zip && <span className="error">{errors.zip}</span>}
          <input
            type="text"
            placeholder='Country'
            name="country"
            value={orderData.country}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          placeholder='phone no. (10 digits)'
          name="phone"
          value={orderData.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>
      <div className="place-order-right">
        <div className="cartitems-total">
          <h1>Cart Total</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button type="submit">PROCEED TO PAY</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
