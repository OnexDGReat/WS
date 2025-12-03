import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import Navbar from "../shared/navbar";
import axiosInstance from "../../api/axiosConfig";
import "./users.css";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false); // Create User mode

    const navigate = useNavigate();

  // Role check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "superadmin") {
      alert("You are not authorized to access this page.");
      navigate("/dashboard");
    }
  }, [navigate]);
  

  // Form state for create user
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
    college: "",
    department: "",
  });
  const [collegesList, setCollegesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Truncate long text for table
  const truncate = (str, max = 30) => (str && str.length > max ? str.slice(0, max) + "..." : str);

  // Fetch users
  const fetchUsers = () => {
    axiosInstance
      .get("/users/")
      .then((res) => setUsers(res.data))
      .catch(console.log);
  };

  // Fetch colleges
  const fetchColleges = () => {
    axiosInstance
      .get("/colleges/")
      .then((res) => setCollegesList(res.data))
      .catch(console.log);
  };

  useEffect(() => {
    fetchUsers();
    fetchColleges();
  }, []);

  // Fetch departments when college changes
  useEffect(() => {
    if (formData.college) {
      axiosInstance
        .get(`/departments/?college_id=${formData.college}`)
        .then((res) => setDepartmentsList(res.data))
        .catch(() => setDepartmentsList([]));
    } else {
      setDepartmentsList([]);
      setFormData((prev) => ({ ...prev, department: "" }));
    }
  }, [formData.college]);

  const openModal = (user = null, create = false) => {
    setSelectedUser(user);
    setCreating(create);

    if (create) {
      setFormData({
        fullname: "",
        email: "",
        password: "",
        role: "",
        college: "",
        department: "",
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setCreating(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleCreateUser = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      fullname: formData.fullname,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      college:
        formData.role === "student" ||
        formData.role === "college_admin" ||
        formData.role === "department_admin"
          ? formData.college || null
          : null,
      department:
        formData.role === "student" || formData.role === "department_admin"
          ? formData.department || null
          : null,
    };

    const res = await axiosInstance.post("/signup/", payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.data.success) {
      alert("User created successfully!");
      closeModal();
      fetchUsers(); // <-- reload the list properly
    } else {
      alert(res.data.error || "Failed to create user.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to create user.");
  } finally {
    setLoading(false);
  }
};
  const handleDelete = (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullname}?`)) return;

    axiosInstance
      .delete(`/users/${user.id}/`)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== user.id)))
      .catch((err) => {
        console.error(err);
        alert("Failed to delete user.");
      });
  };

  return (
    <div className="page-container">
      <Navbar />
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Users</h1>
          <button className="btn add-btn" onClick={() => openModal(null, true)}>
            Create User
          </button>
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
                    <td title={u.college?.name ?? "N/A"}>{truncate(u.college?.name ?? "N/A")}</td>
                    <td title={u.department?.name ?? "N/A"}>{truncate(u.department?.name ?? "N/A")}</td>
                    <td className="actions">
                      <button className="btn view-btn" onClick={() => openModal(u, false)}>View</button>
                      <button className="btn delete-btn" onClick={() => handleDelete(u)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              {creating ? (
                <>
                  <h2>Create User</h2>
                  <form onSubmit={handleCreateUser} className="edit-user-form">
                    <label>
                      Full Name
                      <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required />
                    </label>
                    <label>
                      Email
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </label>
                    <label>
                      Role
                      <select name="role" value={formData.role} onChange={handleChange} required>
                        <option value="">Select Role</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="college_admin">College Admin</option>
                        <option value="department_admin">Department Admin</option>
                        <option value="student">Student</option>
                        <option value="guest">Guest</option>
                      </select>
                    </label>

                    {(formData.role === "college_admin" || formData.role === "department_admin" || formData.role === "student") && (
                      <label>
                        College
                        <select name="college" value={formData.college} onChange={handleChange} required>
                          <option value="">Select College</option>
                          {collegesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </label>
                    )}

                    {(formData.role === "department_admin" || formData.role === "student") && (
                      <label>
                        Department
                        <select name="department" value={formData.department} onChange={handleChange} required>
                          <option value="">Select Department</option>
                          {departmentsList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </label>
                    )}

                    <label>
                      Password
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </label>

                    <div className="form-buttons">
                      <button type="submit" className="btn save-btn" disabled={loading}>
                        {loading ? "Creating..." : "Create"}
                      </button>
                      <button type="button" className="btn btn-close" onClick={closeModal}>Cancel</button>
                    </div>
                  </form>
                </>
              ) : selectedUser ? (
                <>
                  <h2>User Details</h2>
                  <div className="user-details">
                    <p><strong>Full Name:</strong> {selectedUser.fullname}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>College:</strong> {selectedUser.college?.name ?? "N/A"}</p>
                    <p><strong>Department:</strong> {selectedUser.department?.name ?? "N/A"}</p>
                  </div>
                  <div className="form-buttons">
                    <button type="button" className="btn btn-close" onClick={closeModal}>Close</button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
