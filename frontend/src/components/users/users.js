import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import Navbar from "../shared/navbar";
import axiosInstance from "../../api/axiosConfig";
import "./users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    role: "",
    college: null,
    department: null,
    password: "",
  });

  // Fetch users
  const fetchUsers = () => {
    axiosInstance
      .get("/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    axiosInstance
      .delete(`/users/${id}/`)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== id)))
      .catch(console.log);
  };

  // Open modal (View / Edit)
  const openModal = (user, edit = false) => {
    setSelectedUser(user);
    setEditMode(edit);
    setFormData({
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      college: user.college?.id || null,
      department: user.department?.id || null,
      password: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
    setEditMode(false);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update user
  const handleUpdate = (e) => {
    e.preventDefault();
    axiosInstance
      .patch(`/users/${selectedUser.id}/`, formData)
      .then(() => {
        fetchUsers();
        closeModal();
      })
      .catch(console.log);
  };

  return (
    <div className="page-container">
      <Navbar />
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Users</h1>
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
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullname}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.college?.name ?? "N/A"}</td>
                    <td>{u.department?.name ?? "N/A"}</td>
                    <td className="actions">
                      <button onClick={() => openModal(u, false)} className="view-btn">
                        View
                      </button>
                      <button onClick={() => openModal(u, true)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>{editMode ? "Edit User" : "User Details"}</h2>

              {!editMode ? (
                <div className="user-info">
                  <p>
                    <strong>Full Name:</strong> {selectedUser.fullname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedUser.role}
                  </p>
                  <p>
                    <strong>College:</strong> {selectedUser.college?.name ?? "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong> {selectedUser.department?.name ?? "N/A"}
                  </p>
                  <button className="btn-close" onClick={closeModal}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="edit-user-form">
                  <label>
                    Full Name
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Role
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="superadmin">Superadmin</option>
                      <option value="college_admin">College Admin</option>
                      <option value="department_admin">Department Admin</option>
                      <option value="user">User</option>
                      <option value="guest">Guest</option>
                    </select>
                  </label>
                  <label>
                    College
                    <input
                      type="number"
                      name="college"
                      value={formData.college ?? ""}
                      onChange={handleChange}
                      placeholder="College ID"
                    />
                  </label>
                  <label>
                    Department
                    <input
                      type="number"
                      name="department"
                      value={formData.department ?? ""}
                      onChange={handleChange}
                      placeholder="Department ID"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </label>

                  <div className="form-buttons">
                    <button type="submit" className="save-btn">
                      Save
                    </button>
                    <button type="button" className="btn-close" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
