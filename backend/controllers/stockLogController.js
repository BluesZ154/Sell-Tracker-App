import StockLogModel from "../models/StockLog.js";

const getStockLogs = async (req, res) => {
  try {
    const stockLogs = await StockLogModel.find().sort({ createdAt: -1 });
    if (!stockLogs) return res.status(400).json({ msg: "Stock Logs Not Found" });

    return res.status(200).json(stockLogs);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const getStockLogsByProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ msg: "Incomplete Body Data" });

    const stockLogsByProduct = StockLogModel.find({
      productId: productId
    }).sort({ createdAt: -1 });
    if (!stockLogsByProduct) return res.status(400).json({ msg: "Stock Logs By Product Not Found" });

    return res.status(200).json(stockLogsByProduct);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const searchStockLog = async (req, res) => {
  try {
    let input = req.body.input;
    if (!input) return res.status(400).json({ msg: "Input is Empty" });

    input = String(input);

    let normalizedInput;
    normalizedInput = input.replace(/\s+/g, "").toLowerCase();

     const result =
      await StockLogModel.aggregate([
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
  getStockLogs,
  getStockLogsByProduct,
  searchStockLog
}