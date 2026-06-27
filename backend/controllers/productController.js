import ProductModel from "../models/Product.js";
import StockLogModel from "../models/StockLog.js";

const getProduct = async (req, res) => {
  try {
    const products = await ProductModel.find({ isDeleted: false });

    if (!products) return res.status(400).json({ msg: "Products Not Found" });

    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const addProduct = async (req, res) => {
  try {
    const { name, price} = req.body;

    if (!name || !price) {
      return res.status(400).json({ msg: "Incomplete Body Data" });
    }

    const newProduct = await ProductModel.create({ name, price })
    if (!newProduct) return res.status(400).json({ msg: "Failed to Create a New Product" });

    return res.status(200).json({ msg: "Product Added", newProduct });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const { id }= req.body;
    if (!id) return res.status(400).json({ msg: "ID is Required" });

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, { isDeleted: true });
    if (!updatedProduct) return res.status(400).json({ msg: "Failed to Delete Product" });

    return res.status(200).json({ msg: "Product Delete Sucessfully", updatedProduct });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const restockProduct = async (req, res) => {
  try {
    const { productName, productId, amount } = req.body;
    if (!productName || !productId || !amount) return res.status(400).json({ msg: "Incomplete Body Data" });

    const parsedAmount = Number(amount);

    if(
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    ){

      return res.status(400).json({
        msg: "Invalid Amount"
      });

    }

    const restockedProduct = await ProductModel.findById(productId);
    restockedProduct.stock += parsedAmount;

    await restockedProduct.save();

    const newStockLogs = await StockLogModel.create({
      productName,
      productId,
      type: "IN",
      amount
    })
    if (!newStockLogs) return res.status(400).json({ msg: "Failed to Create Stock Logs" });

    return res.status(200).json({ msg: "Restock Product and Create Stock Log Sucessfully", restockedProduct, newStockLogs });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const updateProduct = async (req, res) => {
  try {
    const { name, price, id } = req.body;
    if (!name || !price || !id) return res.status(400).json({ msg: "Incomplete Body Data" });

    if (price < 0) {
      return res.status(400).json({ msg: "Price Can't be Negative" });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id, 
      {
        name, price
      }, {
        new: true
      }
    );

    if (!updatedProduct) return res.status(400).json({ msg: "Product Not Found" });

    return res.status(200).json({ msg: "Restock Product Sucessfully", updatedProduct });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const searchProduct = async (req, res) => {
  try {
    let input = req.body.input;
    const searchBy = req.body.searchBy;
    if (!input) return res.status(400).json({ msg: "Input is Empty" });

    input = String(input);

    let normalizedInput;
    normalizedInput = input.replace(/\s+/g, "").toLowerCase();
  
    let result;
    if (searchBy === "name") {
      result = await ProductModel.aggregate([
        {
          $addFields: {
            normalizedName: {
              $toLower: {
                $replaceAll: {
                  input: "$name",
                  find: " ",
                  replacement: "" 
                }
              }
            }
          }
        },
        {
          $match: {
            normalizedName: {
              $regex: normalizedInput,
              $options: "i"
            }
          }
        }
      ])
    }
    else if (searchBy === "date") {
      result = await ProductModel.aggregate([
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
    }

    return res.status(200).json(result);
  
    } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

const searchProducForCashier = async (req, res) => {
  try {
    let input = req.body.input;
    if (!input) return res.status(400).json({ msg: "Input is Empty" });

    input = String(input);

    let normalizedInput;
    normalizedInput = input.replace(/\s+/g, "").toLowerCase();
  
    let result;
    result = await ProductModel.aggregate([
    {
      $addFields: {
        normalizedName: {
          $toLower: {
            $replaceAll: {
              input: "$name",
              find: " ",
              replacement: "" 
            }
          }
        }
      }
    },
      {
        $match: {
          normalizedName: {
            $regex: normalizedInput,
            $options: "i"
          }
        }
      }
    ])

    return res.status(200).json(result);
  
    } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

export {
  getProduct,
  addProduct,
  deleteProduct,
  restockProduct,
  updateProduct,
  searchProduct,
  searchProducForCashier
}