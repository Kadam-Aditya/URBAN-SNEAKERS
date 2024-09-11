import React from 'react'
import './Navbar.css'
import navlogo from '../Assets/A-logo.png'
import logo from '../Assets/logo1.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={logo} className='nav-logos' alt="" />
      <img src={navlogo} className='nav-logo' alt="" />
    </div>
  )
}

export default Navbar
