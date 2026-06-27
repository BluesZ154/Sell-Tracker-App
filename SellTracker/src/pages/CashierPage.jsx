import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../css/Cashier.css";
import TotalBar from "../components/TotalBar";
import { motion, AnimatePresence } from "framer-motion";

const CashierPage = () => {

  const [ products, setProducts ] = useState([]);
  const [ cart, setCart ] = useState([]);
  const [ error, setError ] = useState("");
  const [ loadingGet, setLoadingGet ] = useState(false);
  const [ notif, setNotif ] = useState("");

  const [ input, setInput ] = useState("");
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

  const handleSearch = async () => {
    try {
      const res = await api.post("/api/product/search-cashier", {
        input,
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
      if (input.trim()) handleSearch();
      else setSearchedProducts([]);
    }, 200);

    return () => clearTimeout(timeout);

  }, [input]);

  useEffect(() => {
    getProducts();
  }, []);

  const displayedData = searchedProducts.length > 0 ? 
    searchedProducts : products;

  const handleAddCart = (product) => {
    if (product.stock < 1) {
      alert("Stok Habis");
      return;
    }

    setCart([...cart, {
      ...product,
      quantity: 1
    }]);
  }

  const handleCancel = (product) => {
    const updatedCart = cart.filter(
      item => item._id != product._id
    );

    setCart(updatedCart);
  }

  const handleIncreaseQty = (product) => {
    const targetItem = cart.find(item => 
      item._id === product._id
    );

    if (targetItem.quantity + 1 > product.stock) {
      alert("Pembelian melebihi stok produk")
      return;
    }

    const updatedCart = cart.map(item => 
      item._id === product._id ? 
      {
        ...item,
        quantity: item.quantity + 1
      } : item
    ) 

    setCart(updatedCart);
  }

  const handleDecreaseQty = (product) => {
    const targetItem = cart.find(
      item => item._id === product._id 
    );

    if(targetItem.quantity === 1) {
      handleCancel(product);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item._id === product._id ? 
      {
        ...item,
        quantity: item.quantity - 1
      } : item
    ) 

    setCart(updatedCart);
  }

  const handleInputOnChange = (e, p) => {
    let value = e.target.value;

    if(value === "") {
      value = "";
    } else {
      value = Number(value);

      if(value < 1) {
        value = 1;
      }

      if(value > p.stock) {
        alert("Pembelian melebihi stok produk");
        return;
      }
    }

    const targetItem = cart.map(
      item => item._id === p._id ?
      {
        ...item, 
        quantity: value
      } : item
    ); 

    setCart(targetItem);
  }

  const handleOnBlur = (p) => {
    const targetItem = cart.find(
      item => item._id === p._id
    );

    if(targetItem.quantity === "") {
      handleCancel(p);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === p._id
        ? {
            ...item,
            quantity: Number(item.quantity)
          }
        : item
    );

    setCart(updatedCart);
  }

  const handleConfirm = async () => {
    try {
      setError("");

      const formattedCart = cart.map(
        item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })
      )

      console.log(cart)
      const res = await api.post("/api/transaction/create", {
        cart: formattedCart
      })

      const data = res.data;
      setNotif("Pembelian Telah Dikonfirmasi!");
      setCart([]);
      await getProducts();
    } catch (error) {
      setError("Confirm Products Failed")
      console.log(error.message);
    }
  }

  const onCancel = () => {
    setCart([]);
  }

  return (
    <div className="page-transition">
      <div className="cashier-container">
        <div className="cashier-section">
          <div className="title-section">
            <h1 className="title">Cashier</h1>

            <p className="text">Buat Pencatatan Transaksi Anda Menjadi Lebih Mudah</p>
          </div>

          <div className="search-section">
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
                {displayedData.map((p) => {
                  const cartItem = cart.find(
                    item => item._id === p._id
                  );

                  return (
                    <motion.tr
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        {p.name}
                      </td>  
                      <td>
                          Rp. {p.price}
                      </td> 
                      <td>{p.stock}</td>
                      <td>
                        { cartItem ? (
                          <>
                            <div className="cart-panel-section">
                              <div className="panel-title-section">
                                <p className="panel-title">{p.name}</p>
                              </div>

                              <div className="qty-section">
                                <input 
                                  type="number" 
                                  placeholder="Masukkan QTY"
                                  value={cartItem.quantity}
                                  onChange={(e) => handleInputOnChange(e, p)}
                                  onBlur={() => handleOnBlur(p)}
                                  className="qty-input"
                                />
                                <button 
                                  className="increase-qty"
                                  onClick={() => handleIncreaseQty(p)}
                                >+</button>
                                <button 
                                  className="decrease-qty"
                                  onClick={() => handleDecreaseQty(p)}
                                >-</button>
                              </div>
                            </div>

                            <div className="sub-total-section">
                              <p className="sub-total-text">
                                SubTotal: Rp. {cartItem.price * cartItem.quantity}
                              </p>
                            </div>

                            <button 
                              className="cancel-cart-button"
                              onClick={() => handleCancel(p)}
                            >                  
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button 
                            className="add-cart-button"
                            onClick={() => handleAddCart(p)}
                          >                  
                            Add
                          </button>
                        ) }
                      </td>
                    </motion.tr>    
                  )
                })}
              </AnimatePresence>  
            </tbody>
          </table>

          {notif && <div className="notif-text">{notif}</div>}

          { cart.length > 0 && 
            <div className="total-bar-section">
              <TotalBar 
                cart={cart}
                onConfirm={handleConfirm}
                onCancel={onCancel}
              />
            </div>  
          }
        </div>
      </div>
    </div>
  )
}

export default CashierPage;