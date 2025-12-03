import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import "./settingsmodal.css";

export default function SettingsModal({ open, onClose }) {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    role: "",
    college: "",
    department: "",
  });

  const [collegesList, setCollegesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    if (open) {
      axiosInstance.get("/current_user/").then((res) => {
        setUserData(res.data);
        setFormData({
          fullname: res.data.fullname,
          email: res.data.email,
          role: res.data.role,
          college: res.data.college || "",
          department: res.data.department || "",
        });
      });

      axiosInstance.get("/colleges/").then((res) => setCollegesList(res.data));
    }
  }, [open]);

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

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
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

      const res = await axiosInstance.put("/update_user/", payload);
      setUserData(res.data);
      setEditing(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {!editing ? (
          <>
            <h2>User Settings</h2>
            <div className="user-details">
              <p><strong>Full Name:</strong> {userData?.fullname}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <p><strong>Role:</strong> {userData?.role}</p>
              <p><strong>College:</strong> {userData?.college || "N/A"}</p>
              <p><strong>Department:</strong> {userData?.department || "N/A"}</p>
            </div>

            <div className="form-buttons">
              <button className="btn save-btn" onClick={() => setEditing(true)}>
                Edit User
              </button>
              <button className="btn btn-close" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Edit Profile</h2>

            <div className="user-details">
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

              <div className="input-group">

                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="">Select User Role</option>
                  <option value="superadmin">Superadmin (OSA Host)</option>
                  <option value="college_admin">College Admin</option>
                  <option value="department_admin">Department Admin</option>
                  <option value="student">Student</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              {(formData.role === "college_admin" || formData.role === "department_admin" || formData.role === "student") && (
                <div className="input-group">

                  <select name="college" value={formData.college} onChange={handleChange} required>
                    <option value="">Select College</option>
                    {collegesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {(formData.role === "department_admin" || formData.role === "student") && (
                <div className="input-group">

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={!formData.college}
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button className="btn save-btn" onClick={handleSave}>Save</button>
              <button className="btn btn-close" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
