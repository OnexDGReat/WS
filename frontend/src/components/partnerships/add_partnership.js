import { useState } from "react";
import Sidebar from "../shared/sidebar";
import axiosInstance from "../../api/axiosConfig";
import "./add_partnership.css";

const AddPartnership = () => {
  const [form, setForm] = useState({
    name: "",
    category: "school",
    department: "",
    address: "",
    website: "",
    email: "",
    phone: "",
    contact_person: "",
    contact_position: "",
    effectivity_start: "",
    effectivity_end: "",
    status: "pending",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axiosInstance
      .post("/partners/", form)
      .then(() => (window.location.href = "/partnerships"))
      .catch((err) => console.log(err));
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h1>Add Partnership</h1>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input name="name" onChange={handleChange} placeholder="Partner Name" required />

            <select name="category" onChange={handleChange}>
              <option value="school">School</option>
              <option value="government">Government</option>
              <option value="ngo">NGO</option>
              <option value="company">Private Company</option>
            </select>

            <input
              name="department"
              onChange={handleChange}
              placeholder="Department"
              required
            />

            <input name="address" onChange={handleChange} placeholder="Address" required />

            <input name="website" onChange={handleChange} placeholder="Website (optional)" />

            <input name="email" onChange={handleChange} placeholder="Email" required />

            <input name="phone" onChange={handleChange} placeholder="Phone" required />

            <input
              name="contact_person"
              onChange={handleChange}
              placeholder="Contact Person"
              required
            />

            <input
              name="contact_position"
              onChange={handleChange}
              placeholder="Contact Position"
              required
            />

            <label>Start Date</label>
            <input type="date" name="effectivity_start" onChange={handleChange} required />

            <label>End Date</label>
            <input type="date" name="effectivity_end" onChange={handleChange} required />

            <select name="status" onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button type="submit" className="btn-save">Save Partnership</button>
        </form>
      </div>
    </div>
  );
};

export default AddPartnership;
