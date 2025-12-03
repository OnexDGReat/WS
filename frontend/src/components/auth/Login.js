import React, { useState, useEffect } from 'react';
import './AuthForm.css';
import axios from "../../api/axiosConfig";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [pendingUsers, setPendingUsers] = useState([]);
  const [declinedUsers, setDeclinedUsers] = useState([]);

  const navigate = useNavigate();

  // Fetch pending and declined users on mount
  useEffect(() => {
    const fetchPendingAndDeclined = async () => {
      try {
        const pendingRes = await axios.get("/pending_users/");
        setPendingUsers(pendingRes.data);

        const declinedRes = await axios.get("/declined_users/");
        setDeclinedUsers(declinedRes.data);
      } catch (err) {
        console.error("Failed to fetch pending/declined users:", err);
      }
    };

    fetchPendingAndDeclined();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Check if the email is in pending or declined list
    if (pendingUsers.some(u => u.email === email)) {
      setErrorMsg("Your account is still pending approval. Please wait!");
      return;
    }
    if (declinedUsers.some(u => u.email === email)) {
      setErrorMsg("Your account request was declined");
      return;
    }

    // Proceed with login
    try {
      const res = await axios.post("login/", { email, password });

      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        setErrorMsg(res.data.error || "Login failed");
      }
    } catch (error) {
      const apiError = error.response?.data?.error;
      setErrorMsg(apiError || "Network or server error");
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
          <h2>Login</h2>

          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <Lock className="input-icon" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button type="submit">Login</button>
          </form>

          <a href="/" className="link">
            Don't have an account? Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
