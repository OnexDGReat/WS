import React, { useState } from "react";
import Sidebar from "../shared/sidebar";
import "./dashboard.css";

export default function Dashboard() {
  // mock data for demo — replace with API fetch later
  const partnerships = [
    {
      id: 1,
      dept1: "CET - BSIT",
      dept2: "InfoSoft",
      start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2023-06-01')),
      end: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2025-12-01')),
      status: "Active"
    },
    {
      id: 2,
      dept1: "CHATME - BSHM",
      dept2: "Dusit",
      start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2020-01-10')),
      end: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2024-01-10')),
      status: "Expired"
    },
    {
      id: 3,
      dept1: "CET - CPE",
      dept2: "Smart",
      start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2022-03-14')),
      end: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date('2026-12-14')),
      status: "Active"
    }
  ];

  const total = partnerships.length;
  const active = partnerships.filter(p => p.status === "Active").length;
  const expired = partnerships.filter(p => p.status === "Expired").length;

  const expiringSoon = partnerships.filter(p => {
    const due = new Date(p.end);
    const today = new Date();
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 60; // 60 days
  }).length;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="content">
        <h1>Dashboard</h1>

        {/* STAT CARDS */}
        <div className="cards-row">
          <div className="card">
            <h3>Total Partnerships</h3>
            <p>{total}</p>
          </div>

          <div className="card">
            <h3>Active Partnerships</h3>
            <p>{active}</p>
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

        {/* TABLE */}
        <div className="table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Company/Department 1</th>
                <th>Company/Department 2</th>
                <th>Date Started</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {partnerships.map((p) => (
                <tr key={p.id}>
                  <td>{p.dept1}</td>
                  <td>{p.dept2}</td>
                  <td>{p.start}</td>
                  <td>{p.end}</td>
                  <td>
                    <span
                      className={
                        p.status === "Active"
                          ? "status active"
                          : "status expired"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                    <button className="edit-btn">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
