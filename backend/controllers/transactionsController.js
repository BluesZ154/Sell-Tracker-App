import ProductModel from "../models/Product.js";
import TransactionModel from "../models/Transactions.js";
import StockLogModel from "../models/StockLog.js"

const createTransaction = async (req, res) => {
  try {
    const { cart } = req.body;
    console.log(cart)
    if (!cart || cart.length === 0) {
      return res.status(400).json({
        msg: "Cart Empty"
      });
    }

    for (let item of cart) {
      const product = await ProductModel.findById(item.productId);
      if (!product) return res.status(400).json({ msg: "Product Not Found" });
    
      if (item.quantity > product.stock) {
        return res.status(400).json({ msg: "Not Enough Stock" });
      }
    }

    let calculatedTotal = 0;

    for (const item of cart) {
      const product = await ProductModel.findById(
        item.productId
      );

      calculatedTotal += (
        product.price * item.quantity
      );
    }

    const newTransaction = await TransactionModel.create({
      items: cart, total: calculatedTotal 
    });
    if (!newTransaction) return res.status(400).json({ msg: "Failed to Create New Transaction" }); 

    for (const item of cart) {
      const product = await ProductModel.findById(
        item.productId
      );

      product.stock -= item.quantity;

      await product.save();

      await StockLogModel.create({
        productName: product.name,
        productId: item.productId,
        type: "OUT",
        amount: item.quantity
      });
    }  
  
    return res.status(200).json({ msg: "New Transaction Created", newTransaction });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const getTransactions = async (req, res) => {
  try {
    const Transactions = await TransactionModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!Transactions) res.status(400).json({ msg: "Transactions Not Found" });

    return res.status(200).json(Transactions);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { id }= req.body;
    if (!id) return res.status(400).json({ msg: "ID is Required" });

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(id, { isDeleted: true });
    if (!updatedTransaction) return res.status(400).json({ msg: "Failed to Delete Product" });

    return res.status(200).json({ msg: "Transaction Delete Sucessfully", updatedTransaction });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const searchTransaction = async (req, res) => {
  try {
    let input = req.body.input;
    if (!input) return res.status(400).json({ msg: "Input is Empty" });

    input = String(input);

    let normalizedInput;
    normalizedInput = input.replace(/\s+/g, "").toLowerCase();

     const result =
      await TransactionModel.aggregate([
      {
        $addFields: {

          formattedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          }

        }
      },

      {
        $match: {
          isDeleted: false,
          formattedDate: {
            $regex: normalizedInput,
            $options: "i"
          }

        }
      }

    ]);
  
    return res.status(200).json(result);
  
    } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
} 

export {
  createTransaction,
  getTransactions,
  deleteTransaction,
  searchTransaction
}