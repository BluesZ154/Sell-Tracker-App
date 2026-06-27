import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <div className="nav-logo-container">
        <span>Sell Tracker</span>
      </div>

      {/* LINKS */}
      <div className={`navbar-links-container ${menuOpen ? "active" : ""}`}>
        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        <NavLink to="/cashier" onClick={() => setMenuOpen(false)}>Cashier</NavLink>
        <NavLink to="/product" onClick={() => setMenuOpen(false)}>Product</NavLink>
        <NavLink to="/transaction" onClick={() => setMenuOpen(false)}>Transactions</NavLink>
        <NavLink to="/restock" onClick={() => setMenuOpen(false)}>Restock</NavLink>
      </div>

      {/* HAMBURGER */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
};

export default Navbar;