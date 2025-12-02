import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import Navbar from "../shared/navbar";
import axiosInstance from "../../api/axiosConfig";
import "./requests.css";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending account requests
  useEffect(() => {
    axiosInstance
      .get("/pending-users/")
      .then((res) => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading requests:", err);
        setLoading(false);
      });
  }, []);

  // Approve a request
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this account request?")) return;

    try {
      await axiosInstance.post(`/pending-users/${id}/approve/`);
      setRequests(requests.filter((r) => r.id !== id));
      alert("User approved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to approve request.");
    }
  };

  // Decline a request
  const handleDecline = async (id) => {
    if (!window.confirm("Decline this account request?")) return;

    try {
      await axiosInstance.post(`/pending-users/${id}/decline/`);
      setRequests(requests.filter((r) => r.id !== id));
      alert("Request declined.");
    } catch (error) {
      console.error(error);
      alert("Failed to decline request.");
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Account Requests</h1>
        </div>

        <div className="table-container">
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>College</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.fullname}</td>
                    <td>{req.email}</td>
                    <td>{req.role}</td>
                    <td>{req.college?.name || "N/A"}</td>
                    <td>{req.department?.name || "N/A"}</td>
                    <td className="actions-cell">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => handleDecline(req.id)}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No pending requests found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
