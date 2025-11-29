import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../shared/sidebar";
import axiosInstance from "../../api/axiosConfig";

const EditPartnership = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/partners/${id}/`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axiosInstance
      .put(`/partners/${id}/`, form)
      .then(() => (window.location.href = "/partnerships"))
      .catch((err) => console.log(err));
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h1>Edit Partnership</h1>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input name="name" value={form.name} onChange={handleChange} />
            <input name="address" value={form.address} onChange={handleChange} />
            <input name="email" value={form.email} onChange={handleChange} />
            <input name="phone" value={form.phone} onChange={handleChange} />
            <input name="contact_person" value={form.contact_person} onChange={handleChange} />
            <input name="contact_position" value={form.contact_position} onChange={handleChange} />
            <input type="date" name="effectivity_start" value={form.effectivity_start} onChange={handleChange} />
            <input type="date" name="effectivity_end" value={form.effectivity_end} onChange={handleChange} />

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button type="submit" className="btn-save">Update Partnership</button>
        </form>
      </div>
    </div>
  );
};

export default EditPartnership;
