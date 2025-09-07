import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
