import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";
import api from "../services/api.js";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        email: email,
        password: password
      })

      const data = res.data;
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");

    } catch (error) {
      setError(error.response?.data?.msg || "Login Failed, Check Your Email and Password")
      console.log(error.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1 className="login-title">
              Sell Tracker
            </h1>
            <p className="login-semi-title">
              Selamat datang kembali! Silahkan Masuk ke Akun Anda!
            </p>
          </div>

          {error && <div className="login-error-text">{error}</div>}

          <form 
            onSubmit={handleSubmit}
            className="login-form-submit-section"
          >
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
                {loading ? "Logging In..." : "Login"}
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Belum Punya Akun?{" "}
              <Link to="/register" className="link-to-register">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage;