import mongoose from "mongoose";

const StockLogSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true
    },

    productId: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["IN", "OUT"]
    },

    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
)

const StockLogModel = mongoose.model('Stocklog', StockLogSchema);

export default StockLogModel;