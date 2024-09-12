import React from 'react'
import './Footer.css'

import footer_logo from '../Assets/logo1.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintrest_icon from '../Assets/linkedin.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo} alt="" />
        <p>Urban Sneakers</p>
      </div>
      <ul className="footer-links">
        <li>Company</li>
        <li>Products</li>
        <li>Offices</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <div className="footer-social-icons">
            <div className="footer-icons-container">
                <a href="https://www.instagram.com/_aditya.kadam/" target="_blank" rel="noopener noreferrer">
                    <img src={instagram_icon} alt="Instagram" />
                </a>
            </div>
            <div className="footer-icons-container">
                <a href="https://www.linkedin.com/in/-kadam-aditya/" target="_blank" rel="noopener noreferrer">
                    <img src={pintrest_icon} alt="Pinterest" />
                </a>
            </div>
            <div className="footer-icons-container">
                <a href="https://api.whatsapp.com/send?phone=919225517770&text=" target="_blank" rel="noopener noreferrer">
                    <img src={whatsapp_icon} alt="WhatsApp" />
                </a>
            </div>
        </div>
      <div className="footer-copyright">
        <hr />
        <p>work.aditykadam@gmail.com</p>
      </div>
    </div>
  )
}

export default Footer
