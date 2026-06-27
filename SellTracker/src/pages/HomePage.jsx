import { useNavigate } from "react-router-dom";
import "../css/Home.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">
            Sell Tracker
          </h1>
        
          <p className="home-description">
            Aplikasi ini dapat mempermudah anda mengelola produk, stok, dan penjualan anda.
          </p>

          <div className="home-btn-group">
            <button 
              className="register-button"
              onClick={() => navigate("/register")}
            >
              Register Now
            </button>

             <button 
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
        <p className="home-footer-text">
          Buat Akun Untuk Mempermudah Laporan Transaksi Anda
          -Sell Tracker
        </p>
      </div>
    </>
  )
}

export default HomePage;