import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { backend_url } from '../App.js';

const LoginSignup = () => {

  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (state === "Sign Up" && !formData.username.trim()) {
      errors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores.";
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      errors.username = "Username must be between 3 and 20 characters.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email)) {
      errors.email = "Invalid email address.";
    }
    if (!formData.password.trim()) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character.";
    } else if (/\s/.test(formData.password)) {
      errors.password = "Password cannot contain spaces.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const login = async () => {
    if (!validate()) return;

    let dataObj;
    await fetch(`${backend_url}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => { dataObj = data; });
    console.log(dataObj);
    if (dataObj.success) {
      localStorage.setItem('auth-token', dataObj.token);
      window.location.replace("/");
    } else {
      alert(dataObj.errors);
    }
  };

  const signup = async () => {
    if (!validate()) return;

    let dataObj;
    await fetch(`${backend_url}/signup`, {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => { dataObj = data; });

    if (dataObj.success) {
      localStorage.setItem('auth-token', dataObj.token);
      window.location.replace("/");
    } else {
      alert(dataObj.errors);
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <>
              <input 
                type="text" 
                placeholder="Your name" 
                name="username" 
                value={formData.username} 
                onChange={changeHandler} 
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </>
          )}
          <input 
            type="email" 
            placeholder="Email address" 
            name="email" 
            value={formData.email} 
            onChange={changeHandler} 
          />
          {errors.email && <p className="error">{errors.email}</p>}
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            value={formData.password} 
            onChange={changeHandler} 
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button onClick={() => { state === "Login" ? login() : signup() }}>Continue</button>

        {state === "Login" ? (
          <p className="loginsignup-login">Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span></p>
        ) : (
          <p className="loginsignup-login">Already have an account? <span onClick={() => { setState("Login") }}>Login here</span></p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
