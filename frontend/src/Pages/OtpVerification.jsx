import React, { useState } from 'react';
import { backend_url } from '../App.js';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/OtpVerification.css';  // Import the CSS

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(4).fill(""));  // 4-digit OTP
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");  // For resend OTP message
  const [isResending, setIsResending] = useState(false);   // Loading state for resend OTP
  const navigate = useNavigate();
  const { state } = useLocation();

  const email = state?.email;  // Get email from local storage
  console.log(email);

  // Handle OTP input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    let otpArr = [...otp];
    otpArr[index] = element.value;
    setOtp(otpArr);

    // Automatically move to the next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Handle OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join(''); 
    console.log(otpCode);

    if (!email) {
      setError("Email not found. Please try again.");
      return;
    }

    try {
      const response = await fetch(`${backend_url}/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),  // Ensure email and otp are sent
      });
      const data = await response.json();

      if (data.success) {
        navigate("/login");  // Redirect after successful OTP verification
      } else {
        setError(data.message || "OTP verification failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      setError("Email not found. Please log in again.");
      return;
    }

    setIsResending(true);  // Start loading state
    setResendMessage("");  // Reset resend message

    try {
      const response = await fetch(`${backend_url}/resendOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        setResendMessage("OTP has been resent to your email.");
      } else {
        setError("Failed to resend OTP. Please try again later.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);  // End loading state
    }
  };

  return (
    <div className="otp-verification-container">
      <p className="otp-check-email">Please check your email for the OTP to verify your account.</p>
      <div className="otp-box">
        <h2>Verify Your OTP</h2>
        {error && <p className="error-message">{error}</p>}
        {resendMessage && <p className="success-message">{resendMessage}</p>}  {/* Resend OTP success message */}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}  // Select input on focus
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="otp-submit-btn">Verify OTP</button>
        </form>

        {/* Resend OTP Link */}
        <div className="resend-otp">
          <p>Didn't receive the OTP? 
            <span onClick={handleResendOTP} className="resend-link">
              {isResending ? "Resending..." : "Resend OTP"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
