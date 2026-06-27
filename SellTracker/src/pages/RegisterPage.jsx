import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Register.css";
import api from "../services/api.js";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/register", {
        username,
        email: email,
        password: password
      })

      const data = res.data;
      navigate("/login");

    } catch (error) {
      const res = error.response?.data;

      if (res?.errors) {
        const messages = res.errors.map(err => err.message).join(", ");
        setError(messages);
      } else {
        setError(res?.msg || "Register Failed, Check Your Data");
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="register-container">
        <div className="register-content">
          <div className="register-header">
            <h1 className="register-title">
              Sell Tracker
            </h1>
            <p className="register-semi-title">
              Register Akunmu Sekarang Untuk Memantau Penjualan Toko Anda Dengan Mudah
            </p>
          </div>

          {error && <div className="register-error-text">{error}</div>}

          <form
            onSubmit={handleSubmit}
            className="register-form-submit-section"
          >
            <div className="username-form">
              <label className="username-form-label">
                Username
              </label>
              <input
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="username-form-input"
                placeholder="Enter Your Username"
              />
            </div>

            <div className="email-form">
              <label className="email-form-label">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-form-input"
                placeholder="Enter Your Email"
              />
            </div>

            <div className="password-form">
              <label className="password-form-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-form-input"
                placeholder="Enter Your Password"
              />
            </div>

            <div className="submit-btn-section">
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Sudah Punya Akun?{" "}
              <Link to="/login" className="link-to-login">
                Login Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage;