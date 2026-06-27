import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../css/Product.css";
import { motion, AnimatePresence } from "framer-motion";

const ProductPage = () => {

  const [ products, setProducts ] = useState([]);
  const [ name, setName ] = useState("");
  const [ price, setPrice ] = useState("");
  const [ notif, setNotif ] = useState("");
  const [ error, setError ] = useState("");

  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const [ loadingDelete, setLoadingDelete ] = useState(false);
  const [ loadingGet, setLoadingGet ] = useState(false);

  const [ editId, setEditId ] = useState(null);
  const [ editName, setEditName ] = useState("");
  const [ editPrice, setEditPrice ] = useState("");

  const [ showRestock, setShowRestock ] = useState(false);
  const [ restockName, setRestockName ] = useState("");  
  const [ restockId, setRestockId ] = useState(null); 
  const [ restockAmount, setRestockAmount ] = useState("");
  const [ loadingRestock, setLoadingRestock ] = useState(false);  

  const [ showDelete, setShowDelete ] = useState(false);
  const [ deleteId, setDeleteId ] = useState(null); 

  const [ input, setInput ] = useState("");
  const [ searchBy, setSearchBy ] = useState("name");
  const [ searchedProducts, setSearchedProducts ] = useState([]);

  const getProducts = async () => {
    setError("");
    try {
      setLoadingGet(true);
      const res = await api.get("/api/product/get");

      const data = res.data;
      setProducts(data);
    } catch (error) {
      setError("Get Products Failed")
      console.log(error.message);
    } finally {
      setLoadingGet(false);
    }
  }

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      setLoadingAdd(true);
      const res = await api.post("/api/product/add", {
        name: name,
        price: price,
        stock: 0
      });

      const data = res.data;
      setNotif(data.msg);
      await getProducts();

      setName("");
      setPrice("");
    } catch (error) {
      setNotif("Add Product Failed")
      console.log(error.message);
    } finally {
      setLoadingAdd(false);
    }
  }

  const handleDelete = (p) => {
    setShowDelete(true);
    setDeleteId(p._id)
  }

  const handleCancelDelete = () => {
    setShowDelete(false);
    setDeleteId(null)
  }

  const deleteProduct = async (id) => {
    setError("");
    try {
      setLoadingDelete(true);
      const res = await api.post("/api/product/delete", {
        id: id
      });

      const data = res.data;
      setShowDelete(false);
      setDeleteId(null);
      await getProducts();
    } catch (error) {
      setError("Delete Product Failed")
      console.log(error.message);
    } finally {
      setLoadingDelete(false);
    }
  }

  const handleEdit = async (p) => {
    setEditId(p._id);
    setEditName(p.name);
    setEditPrice(p.price);
  }

  const handleSave = async (p) => {
    setError("");
    try {
      const res = await api.post("/api/product/update", {
        name: editName, price: editPrice, id: p._id
      })

      setEditId(null);
      await getProducts();
      setName("");
      setPrice("");
    } catch (error) {
      setError("Save Product Failed")
      console.log(error.message);
    }
  }

  const handleCancel = async () => {
    setEditId(null);
    setEditName("");
    setEditPrice("");
  }

  const handleRestock = async (p) => {
    setShowRestock(true);
    setRestockName(p.name);
    setRestockId(p._id)
  }

  const closeRestock = async (p) => {
    setShowRestock(false);
    setRestockId(null);
    setRestockName("");
    setRestockAmount("");
  }

  const submitRestock = async () => {
    try {
      setLoadingRestock(true);
      setError("");

      const res = await api.post("/api/product/restock", {
        productName: restockName,
        productId: restockId,
        amount: Number(restockAmount)
      })

      closeRestock();
      await getProducts();
      
    } catch (error) {
      setError("Restock Product Failed")
      console.log(error.message);
    } finally {
      setLoadingRestock(false);
    }
  }

  const handleSearch = async () => {
    try {
      const res = await api.post("/api/product/search", {
        input,
        searchBy
      });

      const data = res.data;
      setSearchedProducts(data);

    } catch (error) {
      setError("Search Product Failed")
      console.log(error.message);
    }
  }

  useEffect(() => {

    const timeout = setTimeout(() => {
      if(input.trim()) {
        handleSearch();
      } else {
        setSearchedProducts([]);
      }

    }, 400);
    return () => clearTimeout(timeout);

  }, [input, searchBy]);

  useEffect(() => {
    getProducts();
  }, []);

  const displayedData = searchedProducts.length > 0 ? 
    searchedProducts : products;

  return (
    <div className="page-transition">
      <div className="product-container">
        <div className="product-section">

          <div className="title-section">
            <h1 className="product-title">
              Produk Anda
            </h1>
            <p className="product-text">Kelola Produk Anda di Halaman Ini</p>
          </div>

          <div className="add-product-section">
            <h3 className="add-product-title">
              Tambah Produk Baru
            </h3>

            <form
              onSubmit={addProduct}
              className="add-product-form"
            >
              <div className="name-form">
                <label className="name-form-label">
                  Nama:
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="name-form-input"
                  placeholder="Masukkan Nama Produk"
                />
              </div>

              <div className="price-form">
                <label className="price-form-label">
                  Harga:
                </label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="price-form-input"
                  placeholder="Masukkan Harga Produk"
                />
              </div>

              <div className="submit-btn-section">
                <button 
                  type="submit"
                  disabled={loadingAdd}
                  className="submit-btn"
                >
                  {loadingAdd ? "Sedang Menambahkan..." : "Tambah"}
                </button>
              </div>
            </form>

            {notif && <div className="notif-text">{notif}</div>}
          </div>

          <div className="search-section">
            <label htmlFor="searchBy" className="searchBy-label">
              Search By: 
            </label>
            <select name="searchBy" id="searchBy" className="searchBy-input"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="name">Product Name</option>
              <option value="date">Created Date</option>
            </select>

            <label htmlFor="input" className="search-label">
              Search:
            </label>
            <input type="text" name="input" id="input" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="search-input"
            />
          </div>

          <table className="product-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {displayedData.map((p) => (
                  <React.Fragment key={p._id}>
                    <motion.tr
                      key={displayedData._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        { editId === p._id ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          p.name
                        ) }
                      </td>  
                      <td>
                        { editId === p._id ? (
                          <input 
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                          />
                        ) : (
                          `Rp. ${p.price}`
                        )}
                      </td> 
                      <td>{p.stock}</td>
                      <td>
                        { editId === p._id ? (
                          <>
                            <button onClick={() => handleSave(p)}>✔</button>
                            <button onClick={handleCancel}>✖</button>
                          </>
                        ) : (
                          <button onClick={() => handleEdit(p)}>Edit</button>
                        )}
                        <button 
                          onClick={() => handleRestock(p)}
                          disabled={editId !== null}  
                        >Restock</button>
                        <button 
                          onClick={() => handleDelete(p)}
                          disabled={editId !== null}
                        >Delete</button>
                      </td>
                    </motion.tr>

                    <tr className="product-date-row">
                      <td colSpan="4" style={{ fontSize: "12px", color: "gray" }}>
                        Ditambahkan: {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {error && <div className="login-error-text">{error}</div>}

          { showRestock && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Restock Product</h3>

                <input 
                type="number" 
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder="Masukkan Jumlah"
                min={1}
                autoFocus
              />

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={submitRestock}
                  disabled={loadingRestock}
                >{loadingRestock ? "Loading..." : "✔ Tambah"}</button>

                <button
                  onClick={closeRestock}
                >✖ Batal</button>
              </div>
              </div>
            </div>
          )}        

          {showDelete && (
            <div className="modal-overlay">
              <motion.div
                className="modal-content delete-modal"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="delete-title">
                  Hapus Produk?
                </h3>

                <p className="delete-text">
                  Produk yang dihapus tidak akan muncul lagi.
                </p>

                <div className="delete-button-section">
                  <button
                    className="confirm-delete-btn"
                    onClick={() => deleteProduct(deleteId)}
                  >
                    Hapus
                  </button>

                  <button
                    className="cancel-delete-btn"
                    onClick={() => handleCancelDelete()}
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </div>
          )}    
        </div>
      </div>
    </div>
  )
}

export default ProductPage;