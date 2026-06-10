import React from "react";
import { NavLink } from "react-router-dom";
import './Header.css';

const Header = ({ currentUser, onLogout,onLoginClick  }) => {

  const menuData = [
    { menu: 'Home', link: '/' },
    { menu: 'about us', link: '/' },
    { menu: 'service', link: '/' },
    { menu: 'contact us', link: '/' },
  ];

  return (
    <header>
      <div className="container">
        <div className="row">
          <div className="main-nav">

            {/* Logo */}
            <div className="logo">
              <NavLink to='/'>
                <img src="./logo.enc" alt="logo" />
              </NavLink>
            </div>

            {/* Menu */}
            <div className="menubar">
              <ul>
                {menuData.map(({ link, menu }) => (
                  <li key={menu}>
                    <NavLink to={link}>{menu}</NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* User + Logout */}
            <div className="btn">
              {currentUser ? (
                <>
                  <span className="user-name">{currentUser.username}</span>
                  <button onClick={onLogout} className="logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={onLoginClick} className="login-btn">
                  Login
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;