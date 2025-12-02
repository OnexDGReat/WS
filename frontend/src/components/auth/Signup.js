import React, { useState, useEffect } from 'react';
import './AuthForm.css';
import axios from "../../api/axiosConfig";
import { User, Mail, Briefcase, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [collegesList, setCollegesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Fetch all colleges on mount
  useEffect(() => {
    axios.get("/colleges/")
      .then(res => setCollegesList(res.data))
      .catch(err => console.log(err));
  }, []);

  // Fetch departments when a college is selected
  useEffect(() => {
    if (college) {
      axios.get(`/departments/?college_id=${college}`)
        .then(res => setDepartmentsList(res.data))
        .catch(err => {
          console.log(err);
          setDepartmentsList([]);
        });
    } else {
      setDepartmentsList([]);
      setDepartment('');
    }
  }, [college]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Build payload depending on role
    const payload = {
      fullname,
      email,
      password,
      role: position,
      college: (position === 'superadmin') ? null : college || null,
      department: (position === 'department_admin') ? department || null : null,
    };

    try {
      const response = await axios.post(
        "/signup/",
        payload,
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (response.data.success) {
        alert("Signup request sent! Superadmin will review your request.");
        navigate("/login");
      } else {
        setErrorMsg(response.data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      setErrorMsg(error.response?.data?.error || "Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-welcome">
          <h1>Welcome to HCDC OSA Partnership Portal</h1>
          <img src="/hcdc_logo.png" alt="HCDC OSA Logo" className="welcome-image" />
          <p>Manage your partnerships efficiently and securely. Sign up or login to continue!</p>
        </div>

        <div className="auth-box">
          <h2>Sign Up</h2>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User className="input-icon" />
              <input type="text" placeholder="Full Name" value={fullname} onChange={e => setFullname(e.target.value)} required />
            </div>

            <div className="input-group">
              <Mail className="input-icon" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <Briefcase className="input-icon" />
              <select value={position} onChange={e => setPosition(e.target.value)} required>
                <option value="">Select User Role</option>
                <option value="superadmin">Superadmin (OSA Host)</option>
                <option value="college_admin">College Admin</option>
                <option value="department_admin">Department Admin</option>
                <option value="student">Student</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            {/* College dropdown for College / Department Admin */}
            {(position === 'college_admin' || position === 'department_admin') && (
              <div className="input-group">
                <Briefcase className="input-icon" />
                <select value={college} onChange={e => setCollege(e.target.value)} required>
                  <option value="">Select College</option>
                  {collegesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Department dropdown for Department Admin */}
            {position === 'department_admin' && (
              <div className="input-group">
                <Briefcase className="input-icon" />
                <select value={department} onChange={e => setDepartment(e.target.value)} required disabled={!college}>
                  <option value="">Select Department</option>
                  {departmentsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            <div className="input-group">
              <Lock className="input-icon" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <a href="/login" className="link">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
