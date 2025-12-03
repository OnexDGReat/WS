import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../shared/sidebar";
import Navbar from "../shared/navbar";
import axiosInstance from "../../api/axiosConfig";
import "./declinedusers.css";

const DeclinedUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Role check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "superadmin") {
      alert("You are not authorized to access this page.");
      navigate("/dashboard");
    }
  }, [navigate]);

  // Useful for long text
  const truncate = (str, max = 30) =>
    str && str.length > max ? str.slice(0, max) + "..." : str;

  // Fetch declined accounts
  const fetchUsers = () => {
    axiosInstance
      .get("/declined/")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Delete ${user.fullname}? This cannot be undone.`)) return;

    axiosInstance
      .delete(`/declined/${user.id}/`)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== user.id)))
      .catch(() => alert("Failed to delete user."));
  };

  return (
    <div className="page-container">
      <Navbar />
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Declined Users</h1>
        </div>

        <div className="table-container">
          <table className="users-table">
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
              {users.length ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullname}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td title={u.college ?? "N/A"}>
                      {truncate(u.college ?? "N/A")}
                    </td>
                    <td title={u.department ?? "N/A"}>
                      {truncate(u.department ?? "N/A")}
                    </td>
                    <td className="actions">
                      <button className="btn view-btn" onClick={() => openModal(u)}>
                        View
                      </button>
                      <button className="btn delete-btn" onClick={() => handleDelete(u)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No declined users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* VIEW MODAL */}
        {showModal && selectedUser && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>User Details</h2>

              <div className="user-details">
                <p><strong>Full Name:</strong> {selectedUser.fullname}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>College:</strong> {selectedUser.college ?? "N/A"}</p>
                <p><strong>Department:</strong> {selectedUser.department ?? "N/A"}</p>
              </div>

              <div className="form-buttons">
                <button className="btn btn-close" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclinedUsers;
