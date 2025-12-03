import React, { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";
import SettingsModal from "./settingsmodal";
import "./navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    axiosInstance
      .get("current_user/")
      .then((res) => setUser(res.data))
      .catch(() => console.error("Not logged in"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/hcdc_logo.png" alt="HCDC Logo" className="navbar-logo" />
        </div>

        <div className="navbar-right" ref={dropdownRef}>
          <button
            className="user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <User />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <strong>{user?.fullname}</strong>
                <small>
                  {user?.role === "superadmin" && "Superadmin"}
                  {user?.role === "college_admin" && `${user.college} Admin`}
                  {user?.role === "department_admin" &&
                    `${user.department} Admin`}
                </small>
              </div>

              <hr />

              {/* Settings */}
              <button
                className="dropdown-item"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings size={16} /> Settings and Profile
              </button>

              {/* Logout */}
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onSave={(data) => {
          console.log("SAVE SETTINGS:", data);
          // TODO: call backend update
          setSettingsOpen(false);
        }}
      />
    </>
  );
}
