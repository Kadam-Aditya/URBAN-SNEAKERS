import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import "./CSS/LoginSignup.css";
import { backend_url } from '../App.js';



const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); // Initialize useNavigate

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
    setLoading(true);
    try {
      const response = await fetch(`${backend_url}/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',  // Correcting header from 'application/form-data' to 'application/json'
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const dataObj = await response.json();
      
      if (response.ok && dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        window.location.replace("/");
      } else if (dataObj.otpRequired) {
        // Redirect to OTP verification if OTP is not verified
        navigate('/otpverification', { state: { email: formData.email } });
      } else {
        // Show the error message if the login fails
        alert(dataObj.errors || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const signup = async () => {
    if (!validate()) return;
    setLoading(true); 

    try {
      const response = await fetch(`${backend_url}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (data.existingUser) {
        alert(data.message);
        window.location.href = '/login';
      }
      else{
        navigate('/otpverification', { state: { email: formData.email } });
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // End loading
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

        <button
          onClick={() => {
            if (state === "Login") {
              login();
            } else if (state === "Sign Up") {
              signup();
            }
          }}
          disabled={loading}
        >
          {loading ? <div className="spinner"></div> : "Continue"}
        </button>



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