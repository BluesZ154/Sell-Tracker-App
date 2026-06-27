import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import "../css/Restock.css";
import { motion, AnimatePresence } from "framer-motion";

const RestockPage = () => {

  const [ logs, setLogs ] = useState([]);
  const [ products, setProducts ] = useState([]);

  const [ input, setInput ] = useState("");
  const [ searchedStockLog, setSearchedStockLog] = useState([]);

  const addedLogs = (logs, products) => {
    return logs.map(log => {
      const product = products.find(p => (
        p._id === log.productId
      ));

      return {
        ...log,
        productName: product?.name
      }
    })
  }

  const handleSearch = async () => {
    try {
      const res = await api.post("/api/stocklogs/search", {
        input
      });

      const data = res.data;
      setSearchedStockLog(data);

    } catch (error) {
      setError("Search Stock Log Failed")
      console.log(error.message);
    }
  }

  useEffect(() => {

    const timeout = setTimeout(() => {
      if (input.trim()) handleSearch();
      else setSearchedStockLog([]); 
    }, 400);

    return () => clearTimeout(timeout);

  }, [input]);

  useEffect(() => {
    const init = async () => {
      const resProduct = await api.get("/api/product/get");

      const dataProduct = resProduct.data;
      setProducts(dataProduct);

      const resStock = await api.get("/api/stocklogs/get");

      const dataStock = resStock.data;

      setLogs(dataStock);
    };

    init();
  }, [])

  const displayedData = searchedStockLog.length > 0 ? 
    searchedStockLog : logs;

  return (
    <div className="page-transition">
      <div className="restock-container">
        <div className="restock-section">
          <div className="restock-title-section">
            <div className="restock-title">
              <h1>Products Stock Logs</h1>
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

            <table className="product-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
    
              <tbody>
                <AnimatePresence>
                  {displayedData.map(log => (
                    <motion.tr 
                      key={log._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        <p className="date">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
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
                        <p className="name">{log.productName}</p>
                      </td>

                      <td>
                        <p className={`amount ${log.type === "OUT" ? "out" : "in"}`}>
                          {log.type === "IN" ? "+" : "-"}
                          {log.amount}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestockPage;