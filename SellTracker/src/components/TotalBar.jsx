import react from "react";
import "../css/TotalBar.css";

const TotalBar = ({ cart, onConfirm, onCancel }) => {

  const totalQuantity = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  const totalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  const summaryText = () => {
    return cart.map(item => 
      `${item.name}(${item.quantity})`
    ).join(", ");
  }

  return (
    <div className="total-bar-container">
      <div className="total-qty-section">
        {totalQuantity()}
      </div>

      <div className="total-price-section">
        {totalPrice()}
      </div>

      <div className="text-summary-section">
        {summaryText()}
      </div>

      <div className="btn-section">
        <button 
          onClick={onConfirm}
          className="confirm-btn"
        >Confirm</button>

        <button 
          onClick={onCancel}
          className="cancel-btn"
        >Cancel</button>
      </div>
    </div>
  )
}

export default TotalBar;