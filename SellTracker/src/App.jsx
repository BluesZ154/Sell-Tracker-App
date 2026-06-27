import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import { useState } from "react";
import CashierPage from "./pages/CashierPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import TransactionPage from "./pages/TransactionPage";
import ProtectedRoute from "./components/auth/ProtectedRoutes";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import RestockPage from "./pages/RestockPage";

const App = () => {

  return (
    <Router>
      <Routes>
        
        <Route 
          path="/" element={<HomePage />}
        />

        <Route 
          path="/login" element={<LoginPage />}
        />

        <Route 
          path="/register" element={<RegisterPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWithNavbar />}>
            <Route path="/cashier" element={<CashierPage />}></Route>
            <Route path="/dashboard" element={<DashboardPage />}></Route>
            <Route path="/home" element={<HomePage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/product" element={<ProductPage />}></Route>
            <Route path="/register" element={<RegisterPage />}></Route>
            <Route path="/transaction" element={<TransactionPage />}></Route>
            <Route path="/restock" element={<RestockPage />}></Route>
          </Route>
        </Route>

      </Routes>
    </Router>
  )
}

export default App;