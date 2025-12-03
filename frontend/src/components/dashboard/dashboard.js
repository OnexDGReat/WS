import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import Navbar from "../shared/navbar";
import axiosInstance from "../../api/axiosConfig";
import "./dashboard.css";

const Dashboard = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    // Fetch all partnerships
    axiosInstance.get("/partners/")
      .then((res) => setPartners(res.data))
      .catch(console.log);
  }, []);

  // Calculate stats
  const totalPartnerships = partners.length;
  const activePartnerships = partners.filter(p => p.status.toLowerCase() === "active").length;
  const expiringSoon = partners.filter(p => {
    if (!p.effectivity_end) return false;
    const endDate = new Date(p.effectivity_end);
    const now = new Date();
    const diffDays = (endDate - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30; // expiring within 30 days
  }).length;
  const expired = partners.filter(p => p.status.toLowerCase() === "expired").length;

  return (
    <div className="page-container">
      <Navbar />
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        <div className="cards-row">
          <div className="card">
            <h3>Total Partnerships</h3>
            <p>{totalPartnerships}</p>
          </div>

          <div className="card">
            <h3>Active Partnerships</h3>
            <p>{activePartnerships}</p>
          </div>

          <div className="card">
            <h3>Expiring Soon</h3>
            <p>{expiringSoon}</p>
          </div>

          <div className="card">
            <h3>Expired</h3>
            <p>{expired}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
