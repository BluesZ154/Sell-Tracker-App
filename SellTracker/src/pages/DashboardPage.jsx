import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../css/Dashboard.css";
import { getBusinessReport } from "../services/reportUtils.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DashboardPage = () => {

  const [ error, setError ] = useState("");
  const [ products, setProducts ] = useState([]);
  const [ transactionLogs, setTransactionLogs ] = useState([]);
  const [ stockLogs, setStockLogs ] = useState([]);

  const [ showDetail, setShowDetail ] = useState(false);
  const [ selectedTransaction, setSelectedTransaction ] = useState(null);

  const handleShowDetails = (transaction) => {
    setShowDetail(true);
    setSelectedTransaction(transaction);
  }

  const closeDetails = async (transaction) => {
    setShowDetail(false);
    setSelectedTransaction(null);
  }

  const getProducts = async () => {
    setError("");
    try {
      const res = await api.get("/api/product/get");

      const data = res.data;
      setProducts(data);
    } catch (error) {
      setError("Get Products Failed")
      console.log(error.message);
    }
  };

  const getTransactionLogs = async () => {
    try {
      const res = await api.get("/api/transaction/get");

      const data = res.data;
      console.log(data)
      setTransactionLogs(data);

    } catch (error) {
      console.log(error.message)
    }
  } 

  const getStockLogs = async () => {
    setError("");
    try {
      const res = await api.get("/api/stocklogs/get");

      const data = res.data;
      setStockLogs(data);
    } catch (error) {
      setError("Get Stock Logs Failed")
      console.log(error.message);
    }
  };

  const totalRevenue = transactionLogs.reduce((sum, transaction) => 
    sum += transaction.total, 0
  );

  const highestPrice = products.reduce((highest, product) => {
      if (!highest) return product;
    
      return product.price > highest.price ?
      product : highest
    },
    null
  );

  const lowestPrice = products.reduce((lowest, product) => {
      if (!lowest) return product;
    
      return product.price < lowest.price ?
      product : lowest
    },
    null
  );

  let soldProducts = {};

  transactionLogs.forEach(transaction => {
    transaction.items.forEach(item => {

      if (!soldProducts[item.productId]) {
        soldProducts[item.productId] = {
          name: item.name,
          quantity: 0
        };
      }

      soldProducts[item.productId].quantity += item.quantity;
    })
  })
  
  const bestSelling= Object.keys(soldProducts).length > 0 ?
    Object.keys(soldProducts).reduce(
    (best, productId) => 
      soldProducts[productId].quantity > soldProducts[best].quantity ?
      soldProducts[productId] : soldProducts[best]
  ) : null;

  const worstSelling = Object.keys(soldProducts).length > 0 ?
    Object.keys(soldProducts).reduce(
    (worst, productId) =>
      soldProducts[productId].quantity < soldProducts[worst].quantity ?
        soldProducts[productId] : soldProducts[worst]
  ) : null;

  const lowStockProduct = products.filter(
    product => product.stock <= 5
  )

  const highestStockProduct = products.reduce((highest, product) => {
      if (!highest) return product;
    
      return product.stock > highest.stock ?
      product : highest
    },
    null
  );

  const recentTransactions = transactionLogs.slice(0, 3);
  const recentRestock = stockLogs.slice(0, 3);

  const businessInsight = `
    Penjualan toko saat ini menghasilkan total pemasukan sebesar
    Rp. ${totalRevenue.toLocaleString("id-ID")}
    dari ${transactionLogs.length} transaksi.

    Produk terlaris saat ini adalah
    ${bestSelling?.name || "-"}
    dengan total penjualan
    ${bestSelling?.quantity || 0} item.

    Sementara itu, produk dengan penjualan terendah adalah
    ${worstSelling?.name || "-"}.

    Produk dengan stok tertinggi saat ini adalah
    ${highestStockProduct?.name || "-"}
    dengan sisa stok
    ${highestStockProduct?.stock || 0} item.

    ${
      lowStockProduct.length > 0
        ? `Terdapat ${lowStockProduct.length} produk dengan stok rendah yang perlu segera direstock, seperti ${lowStockProduct[0]?.name}.`
        : `Semua produk masih memiliki stok yang aman.`
    }
  `;

    const handleExportPDF = async () => {

    const report = await getBusinessReport();
    if (!report) return;
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(20);
    pdf.text(
      "Business Report",
      14,
      18
    );
    pdf.setFontSize(10);
    pdf.text(
      `Generated: ${new Date().toLocaleString("id-ID")}`,
      14,
      25
    );
    pdf.setFontSize(15);
    pdf.text(
      "Summary",
      14,
      38
    );
    pdf.setFontSize(11);
    pdf.text(
      `Total Revenue: Rp ${report.totalRevenue.toLocaleString("id-ID")}`,
      14,
      48
    );
    pdf.text(
      `Total Transactions: ${report.totalTransactions}`,
      14,
      55
    );
    pdf.text(
      `Total Products: ${report.totalProducts}`,
      14,
      62
    );
    pdf.setFontSize(15);
    pdf.text(
      "Selling Statistics",
      14,
      76
    );
    pdf.setFontSize(11);
    pdf.text(
      `Best Selling: ${
        report.bestSelling?.name || "-"
      } (${report.bestSelling?.quantity || 0} sold)`,
      14,
      86
    );
    pdf.text(
      `Worst Selling: ${
        report.worstSelling?.name || "-"
      } (${report.worstSelling?.quantity || 0} sold)`,
      14,
      93
    );
    pdf.setFontSize(15);
    pdf.text(
      "Stock Information",
      14,
      108
    );
    pdf.setFontSize(11);
    pdf.text(
      `Highest Stock: ${
        report.highestStockProduct?.name || "-"
      } (${report.highestStockProduct?.stock || 0} items)`,
      14,
      118
    );

    let currentY = 128;

    pdf.text(
      "Low Stock Products:",
      14,
      currentY
    );

    currentY += 8;

    if (report.lowStockProducts.length > 0) {
      report.lowStockProducts.forEach(product => {
        pdf.text(
          `• ${product.name} (${product.stock} left)`,
          18,
          currentY
        );
        currentY += 7;
      });
    } else {
      pdf.text(
        "All product stocks are safe.",
        18,
        currentY
      );

      currentY += 7;
    }
    currentY += 10;

    pdf.setFontSize(15);
    pdf.text(
      "Business Insight",
      14,
      currentY
    );
    currentY += 10;

    pdf.setFontSize(11);
    const insightLines = pdf.splitTextToSize(
      businessInsight,
      180
    );
    pdf.text(
      insightLines,
      14,
      currentY
    );
    currentY += insightLines.length * 6;
    currentY += 10;

    autoTable(pdf, {
      startY: currentY,
      head: [[
        "Date",
        "Total"
      ]],
      body: report.recentTransactions.map(transaction => [
        new Date(
          transaction.createdAt
        ).toLocaleString("id-ID"),

        `Rp ${transaction.total.toLocaleString("id-ID")}`
      ])
    });
    pdf.save("business-report.pdf");
  };

  useEffect(() => {
    getProducts();
    getTransactionLogs();
    getStockLogs();
  }, []);

  return (
    <div className="page-transition">
      <div className="dashboard-container">
        <div className="dashboard-section">

          {/* ===== HEADER ===== */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Monitor toko dan performa bisnis Anda
            </p>
          </div>

          {/* ===== SUMMARY ===== */}
          <div className="summary-grid">

            <div className="summary-card revenue-card">
              <span className="card-label">TOTAL PEMASUKAN</span>
              <h2>
                Rp. {totalRevenue.toLocaleString("id-ID")}
              </h2>
            </div>

            <div className="summary-card">
              <span className="card-label">TOTAL TRANSAKSI</span>
              <h2>{transactionLogs.length}</h2>
            </div>

            <div className="summary-card">
              <span className="card-label">TOTAL PRODUK</span>
              <h2>{products.length}</h2>
            </div>

          </div>

          {/* ===== PRICE INFO ===== */}
          <div className="double-grid">

            <div className="info-card">
              <div className="card-dot blue"></div>

              <span className="info-label">
                HARGA TERTINGGI
              </span>

              <h3>
                {highestPrice?.name || "-"}
              </h3>

              <p>
                Rp. {highestPrice?.price?.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="info-card">
              <div className="card-dot purple"></div>

              <span className="info-label">
                HARGA TERENDAH
              </span>

              <h3>
                {lowestPrice?.name || "-"}
              </h3>

              <p>
                Rp. {lowestPrice?.price?.toLocaleString("id-ID")}
              </p>
            </div>

          </div>

          {/* ===== SELLING ===== */}
          <div className="double-grid">

            <div className="info-card">
              <div className="card-dot green"></div>

              <span className="info-label">
                BEST SELLING
              </span>

              <h3>
                {bestSelling?.name || "-"}
              </h3>

              <p>
                {bestSelling?.quantity || 0} sold
              </p>
            </div>

            <div className="info-card">
              <div className="card-dot red"></div>

              <span className="info-label">
                WORST SELLING
              </span>

              <h3>
                {worstSelling?.name || "-"}
              </h3>

              <p>
                {worstSelling?.quantity || 0} sold
              </p>
            </div>

          </div>

          {/* ===== STOCK ===== */}
          <div className="double-grid">

            <div className="info-card">
              <div className="card-dot orange"></div>

              <span className="info-label">
                LOW STOCK PRODUCTS
              </span>

              <div className="stock-list">
                {lowStockProduct.length > 0 ? (
                  lowStockProduct.map(product => (
                    <div
                      key={product._id}
                      className="stock-item"
                    >
                      <span>{product.name}</span>

                      <span className="danger-stock">
                        {product.stock} left
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="safe-stock">
                    Semua stok aman
                  </p>
                )}
              </div>
            </div>

            <div className="info-card">
              <div className="card-dot green"></div>

              <span className="info-label">
                HIGHEST STOCK
              </span>

              <h3>
                {highestStockProduct?.name || "-"}
              </h3>

              <p>
                {highestStockProduct?.stock || 0} items
              </p>
            </div>

          </div>

          {/* ===== RECENT TRANSACTION ===== */}
          <div className="table-card">

            <div className="table-header">
              <h2>Recent Transactions</h2>
            </div>

            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Detail</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td>
                      {new Date(transaction.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="table-total">
                      Rp. {transaction.total.toLocaleString("id-ID")}
                    </td>

                    <td>
                      <button
                        className="details-btn"
                        onClick={() =>
                          handleShowDetails(transaction)
                        }
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* ===== RECENT RESTOCK ===== */}
          <div className="table-card">

            <div className="table-header">
              <h2>Recent Restock</h2>
            </div>

            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Jumlah</th>
                </tr>
              </thead>

              <tbody>
                {recentRestock.map(log => (
                  <tr key={log._id}>
                    <td>
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td>{log.productName}</td>

                    <td
                      className={
                        log.type === "OUT"
                          ? "amount-out"
                          : "amount-in"
                      }
                    >
                      {log.type === "IN" ? "+" : "-"}
                      {log.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* ===== INSIGHT ===== */}
          <div className="insight-card">

            <div className="insight-header">
              <div className="card-dot purple"></div>

              <h2>Business Insight</h2>
            </div>

            <p className="insight-text">
              {businessInsight}
            </p>

          </div>

          <div className="export-to-pdf-section">
            <button 
              className="export-pdf-btn"
              onClick={() => handleExportPDF()}
            >Export PDF</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardPage;