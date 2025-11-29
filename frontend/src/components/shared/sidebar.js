import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Link, useLocation } from "react-router-dom";

import {
  Menu,
  ChartColumnBig,
  Handshake,
  School,
  FileChartColumn,
  Settings,
  LogOut
} from "lucide-react";

import "./sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    axiosInstance
      .get("current_user/")
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/login"));
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("logout/");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <ChartColumnBig /> },
    { name: "Partnerships", path: "/partnerships", icon: <Handshake /> },
    { name: "Colleges", path: "/colleges", icon: <School /> },
    { name: "Reports", path: "/reports", icon: <FileChartColumn /> },
    { name: "Settings", path: "/settings", icon: <Settings /> }
  ];

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
      {/* toggle is absolutely positioned so it won't shift */}
      <button
        className="toggle-btn"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu />
      </button>

      {/* header area contains only the logo (centered) */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="logo-section">
            <img src="/hcdc_logo.png" alt="HCDC Logo" className="hcdc-logo" />
            <div className="logo-text">OSA</div>
          </div>
        )}
        {/* show a smaller centered logo when collapsed */}
        {collapsed && (
          <div className="logo-collapsed">
            <img src="/hcdc_logo.png" alt="HCDC Logo" className="hcdc-logo-small" />
          </div>
        )}
        <hr className="divider" />
      </div>

      {/* user info (hidden in collapsed mode to save space) */}
      {!collapsed && user && (
        <div className="user-info">
          <h3>{user.fullname}</h3>
          <p>{user.position}</p>
        </div>
      )}

      {/* menu separated below */}
      <ul className="menu">
        {navItems.map((item, i) => (
          <li key={i} className={location.pathname === item.path ? "active" : ""}>
            <Link to={item.path} className="menu-link">
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.name}</span>}
            </Link>
          </li>
        ))}

        <li className="logout-item" onClick={handleLogout}>
          <span className="icon">
            <LogOut />
          </span>
          {!collapsed && <span className="label">Logout</span>}
        </li>
      </ul>
    </div>
  );
}
