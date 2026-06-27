import React, { useState, useEffect, use } from "react";
import api from "../services/api.js";
import "../css/Transaction.css";
import { motion, AnimatePresence } from "framer-motion";

const TransactionPage = () => {

  const [ transactionLogs, setTransactionLogs ] = useState([]);
  const [ showDetail, setShowDetail ] = useState(false);
  const [ selectedTransaction, setSelectedTransaction ] = useState(null);
  
  const [ input, setInput ] = useState("");
  const [ searchedTransaction, setSearchedTransaction] = useState([]);

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

  const countQuantity = (transaction) => {
    return transaction.items.reduce((sum, t) => sum += t.quantity, 0);
  }

  const handleShowDetails = (transaction) => {
    setShowDetail(true);
    setSelectedTransaction(transaction);
  }

  const closeDetails = async (transaction) => {
    setShowDetail(false);
    setSelectedTransaction(null);
  }

  const totalPemasukan = transactionLogs.reduce((total, transaction) => 
    total += transaction.total, 0
  )

  const totalJumlah = () => {
    return transactionLogs.reduce(
      (total, transaction) =>
        total +
        transaction.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      0
    );
  };

  const handleSearch = async () => {
    try {
      const res = await api.post("/api/transaction/search", {
        input
      });

      const data = res.data;
      setSearchedTransaction(data);

    } catch (error) {
      setError("Search Transaction Failed")
      console.log(error.message);
    }
  }

  useEffect(() => {

    const timeout = setTimeout(() => {
      if (input.trim()) handleSearch();
      else getTransactionLogs(); 
    }, 400);

    return () => clearTimeout(timeout);

  }, [input]);

  const displayedData = searchedTransaction.length > 0 ? 
    searchedTransaction : transactionLogs;

  return (
    <div className="page-transition">
      <div className="transaction-container">
        <div className="transaction-section">
          <div className="transaction-title-section">
            <div className="transaction-title">
              <h1>Products Transactions</h1>
            </div>
          </div>

          <div className="data-section">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Total Pemasukan</th>
                  <th>Total Transaksi</th>
                  <th>Total Jumlah Terjual</th>
                </tr>
              </thead>
    
              <tbody>
                <tr>
                  <td>
                    Rp. {totalPemasukan.toLocaleString("id-ID")}
                  </td>
                  <td>{transactionLogs.length}</td>
                  <td>{totalJumlah()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="search-section">
            <label htmlFor="input" className="search-label">
              Search:
            </label>
            <input type="date" name="input" id="input" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="search-input"
            />
          </div>

          <table className="transaction-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Items</th>
                <th>Jumlah</th>
                <th>Total</th>
                <th>Detail</th>
              </tr>
            </thead>
  
            <tbody>
              <AnimatePresence>
                {displayedData.map(transaction => (
                  <motion.tr 
                    key={transaction._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>
                      <p className="date">
                        {new Date(transaction.createdAt).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    <td>
                      <p className="items">{transaction.items.length}</p>
                    </td>

                    <td>
                      <p className="quantity">{countQuantity(transaction)}</p>
                    </td>

                    <td className="total">
                      Rp. {transaction.total.toLocaleString("id-ID")}
                    </td>

                    <td>
                      <button
                        className="details-btn"
                        onClick={() => handleShowDetails(transaction)}
                      >Lihat Details</button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        { showDetail && (
          <div className="detail-modal-overlay">
            <div className="detail-modal-content">
              <h3>Transaction Details</h3>

              <table className="transaction-details-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
      
                <tbody>
                    {selectedTransaction?.items.map(log => (
                      <tr>
                        <td>{log.name}</td>
                        <td>{log.price}</td>
                        <td>{log.quantity}</td>
                        <td>
                          Rp {(log.price * log.quantity).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="close-section">
                <button 
                  className="close-btn"
                  onClick={() => closeDetails()}
                >Close</button>
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}

export default TransactionPage;